#!/usr/bin/env bash
# Put the Anthropic key on the demo VM without it appearing anywhere readable:
# not in your shell history, not in a command line, not in this repo.
#
#   ./deploy/set-key.sh
#
# It prompts for the key with echo off, writes a 0600 env file locally, copies
# it to the VM, deletes the local copy, and restarts the service.
set -euo pipefail

VM="${COPILOT_VM:-campaign-copilot}"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
chmod 600 "$TMP"

read -rsp "Anthropic API key (input hidden): " KEY
echo
[ -n "$KEY" ] || { echo "no key entered, nothing changed" >&2; exit 1; }

cat > "$TMP" <<EOF
ANTHROPIC_API_KEY=$KEY
DATABASE_URL=sqlite:////opt/copilot/backend/copilot.sqlite3
STATIC_DIR=/opt/copilot/backend/static
RATE_LIMIT_PER_IP_PER_HOUR=20
RATE_LIMIT_GLOBAL_PER_DAY=300
EOF
unset KEY

freestyle vm scp "$TMP" "$VM:/tmp/copilot.env"
freestyle vm exec "$VM" -- bash -lc \
  'mv /tmp/copilot.env /opt/copilot/backend/.env && chmod 600 /opt/copilot/backend/.env && sudo systemctl restart copilot && sleep 3 && curl -sf localhost:8000/health'
echo
echo "done. The demo now generates with the real model."
