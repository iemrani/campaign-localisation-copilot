import json
from typing import Any, Dict

from .config import settings

try:
    from anthropic import Anthropic
except ImportError:
    Anthropic = None


class LLMClient:
    def __init__(self):
        self.provider = settings.llm_provider
        self.model = settings.claude_model
        self.client = None

        if self.provider == "claude" and settings.anthropic_api_key and Anthropic:
            self.client = Anthropic(api_key=settings.anthropic_api_key)

    def _mock_campaign_spec(self, brief_text: str, guidelines_text: str) -> Dict[str, Any]:
        return {
            "campaign_summary": brief_text[:300] if brief_text else "",
            "key_messages": [
                "Premium coffee experience",
                "Consistent global brand tone",
                "Clear call to action"
            ],
            "mandatory_claims": [
                "Do not invent product facts",
                "Respect brand guidelines"
            ],
            "tone_of_voice": "premium, warm, concise",
            "channels_supported": ["email", "instagram", "pos"],
            "compliance_constraints": [
                "Avoid unsupported sustainability claims",
                "Flag strong health-related claims"
            ]
        }

    def _mock_local_copy(self, spec: Dict[str, Any], market_name: str, language: str, channel_name: str) -> Dict[str, Any]:
        text = (
            f"[{market_name} - {channel_name}]\n"
            f"Tone: {spec.get('tone_of_voice', 'premium, warm, concise')}\n\n"
            f"Headline: Discover a richer coffee moment.\n"
            f"Body: Crafted for coffee lovers who value quality and everyday ritual. "
            f"Explore our latest blend and bring premium taste into your routine.\n"
            f"CTA: Discover more."
        )
        return {
            "generated_text": text,
            "reasoning": f"Localized for {market_name} in {language} for the {channel_name} channel.",
            "risk_flags": {
                "missing_disclaimer": False,
                "tone_issue": False,
                "claim_risk": False
            }
        }

    def _mock_compliance_check(self, generated_text: str) -> Dict[str, Any]:
        lower_text = (generated_text or "").lower()
        risk_flags = {
            "missing_disclaimer": "sustainable" in lower_text,
            "tone_issue": False,
            "claim_risk": any(word in lower_text for word in ["healthier", "best in the world", "guaranteed"])
        }
        suggestions = []
        if risk_flags["missing_disclaimer"]:
            suggestions.append("Add evidence or disclaimer for sustainability-related claim.")
        if risk_flags["claim_risk"]:
            suggestions.append("Soften absolute or unverifiable claims.")
        return {
            "risk_flags": risk_flags,
            "suggestions": suggestions
        }

    def extract_campaign_spec(self, brief_text: str, guidelines_text: str) -> Dict[str, Any]:
        if not self.client:
            return self._mock_campaign_spec(brief_text, guidelines_text)

        prompt = f"""
You are an enterprise AI workflow component.
Extract a structured campaign specification from the following inputs.

Return strict JSON with keys:
campaign_summary, key_messages, mandatory_claims, tone_of_voice, channels_supported, compliance_constraints.

BRIEF:
{brief_text}

GUIDELINES:
{guidelines_text}
"""
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1200,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text
        return json.loads(text)

    def generate_local_copy(self, spec: Dict[str, Any], market_name: str, language: str, channel_name: str) -> Dict[str, Any]:
        if not self.client:
            return self._mock_local_copy(spec, market_name, language, channel_name)

        prompt = f"""
You are a localization agent for a global coffee brand.

Create localized marketing copy for:
- Market: {market_name}
- Language: {language}
- Channel: {channel_name}

Campaign spec:
{json.dumps(spec, ensure_ascii=False, indent=2)}

Return strict JSON with keys:
generated_text, reasoning, risk_flags
"""
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1200,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text
        return json.loads(text)

    def check_compliance(self, generated_text: str) -> Dict[str, Any]:
        if not self.client:
            return self._mock_compliance_check(generated_text)

        prompt = f"""
You are a compliance and brand review agent.

Review the following marketing copy and return strict JSON with keys:
risk_flags, suggestions

Marketing copy:
{generated_text}
"""
        response = self.client.messages.create(
            model=self.model,
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text
        return json.loads(text)