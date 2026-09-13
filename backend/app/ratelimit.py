"""Spend guard for the public demo.

The three LLM-backed endpoints are the only ones that cost money, so only those
are metered. Two independent limits: a per-visitor hourly window that stops one
person hammering the demo, and a global daily cap that bounds the worst case
for the whole deployment. Both live in memory: the demo runs as a single
process and a restart resetting the counters is acceptable here.
"""

import time
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import JSONResponse

# Paths whose handlers reach Anthropic. Matched as prefixes/suffixes because two
# of them carry a path parameter.
_METERED = (
    lambda p: p == "/localise",
    lambda p: p.startswith("/campaigns/") and p.endswith("/ingest"),
    lambda p: p.startswith("/variants/") and p.endswith("/check"),
)

_HOUR = 3600
_DAY = 86400


class SpendGuard:
    def __init__(self, per_ip_per_hour: int, global_per_day: int):
        self.per_ip_per_hour = per_ip_per_hour
        self.global_per_day = global_per_day
        self._by_ip: dict[str, deque[float]] = defaultdict(deque)
        self._global: deque[float] = deque()

    @staticmethod
    def _trim(window: deque[float], horizon: float, now: float) -> None:
        while window and now - window[0] > horizon:
            window.popleft()

    def check(self, ip: str) -> str | None:
        """Return a refusal reason, or None to let the request through."""
        now = time.time()

        self._trim(self._global, _DAY, now)
        if len(self._global) >= self.global_per_day:
            return "This demo has reached its daily generation limit. Try again tomorrow."

        window = self._by_ip[ip]
        self._trim(window, _HOUR, now)
        if len(window) >= self.per_ip_per_hour:
            return "Too many generations from this address. Try again in an hour."

        window.append(now)
        self._global.append(now)
        return None


def client_ip(request: Request) -> str:
    # Freestyle terminates TLS at its edge, so the socket address is the proxy.
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def install(app, per_ip_per_hour: int, global_per_day: int) -> None:
    guard = SpendGuard(per_ip_per_hour, global_per_day)

    @app.middleware("http")
    async def spend_guard(request: Request, call_next):
        path = request.url.path
        if request.method == "POST" and any(match(path) for match in _METERED):
            reason = guard.check(client_ip(request))
            if reason:
                return JSONResponse(status_code=429, content={"detail": reason})
        return await call_next(request)
