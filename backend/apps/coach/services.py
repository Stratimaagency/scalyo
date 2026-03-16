import json
from abc import ABC, abstractmethod
from django.conf import settings


# ──────────────────────────────────────────────
# OCP: Coach mode registry — add new modes without modifying service code
# ──────────────────────────────────────────────

class CoachModeRegistry:
    """OCP: New coaching modes can be registered without modifying existing code."""

    def __init__(self):
        self._modes = {}

    def register(self, mode_id, system_prompt):
        self._modes[mode_id] = system_prompt

    def get_prompt(self, mode_id, default='coach'):
        return self._modes.get(mode_id, self._modes.get(default, ''))

    def available_modes(self):
        return list(self._modes.keys())


# Default registry with built-in modes
coach_mode_registry = CoachModeRegistry()

coach_mode_registry.register('coach', (
    "Tu es un expert Customer Success senior avec 15 ans d'expérience. "
    "Tu conseilles des CS Managers et CSMs sur : stratégie CS, rétention, expansion, health scoring, "
    "QBR, onboarding, gestion d'équipe, prévention du churn, NPS, playbooks. "
    "Réponds de manière structurée, actionnable et bienveillante. Utilise la langue de l'utilisateur."
))

coach_mode_registry.register('nova', (
    "Tu es Nova, assistante bien-être dédiée aux équipes Customer Success. "
    "Tu aides les CSMs à gérer le stress, la charge mentale, les conflits, l'épuisement professionnel. "
    "Tu es empathique, bienveillante et professionnelle. Tout est confidentiel. "
    "Réponds dans la langue de l'utilisateur."
))


# ──────────────────────────────────────────────
# DIP: Abstract AI client interface
# ──────────────────────────────────────────────

class AIClient(ABC):
    """DIP: Abstract interface for AI providers. Concrete implementations
    can be swapped without changing service code."""

    @abstractmethod
    def chat(self, model, max_tokens, system, messages):
        """Send a chat request and return a response dict with 'content' and 'role'."""

    @abstractmethod
    def stream(self, model, max_tokens, system, messages):
        """Return a generator yielding SSE-formatted text chunks."""


class AnthropicAIClient(AIClient):
    """Concrete AI client implementation using Anthropic's API."""

    def __init__(self, api_key=None):
        self._api_key = api_key or settings.ANTHROPIC_API_KEY
        if not self._api_key:
            raise ValueError('ANTHROPIC_API_KEY is not configured.')
        import anthropic
        self._client = anthropic.Anthropic(api_key=self._api_key)

    def chat(self, model, max_tokens, system, messages):
        response = self._client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=messages,
        )
        return {
            'content': response.content[0].text,
            'role': 'assistant',
        }

    def stream(self, model, max_tokens, system, messages):
        def event_generator():
            try:
                with self._client.messages.stream(
                    model=model,
                    max_tokens=max_tokens,
                    system=system,
                    messages=messages,
                ) as stream:
                    for text in stream.text_stream:
                        yield f"data: {json.dumps({'text': text})}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return event_generator()


# ──────────────────────────────────────────────
# ISP: Separated chat and stream service interfaces
# ──────────────────────────────────────────────

MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 1024


class CoachChatService:
    """ISP: Handles only synchronous chat interactions.
    DIP: Depends on AIClient abstraction, not a concrete implementation."""

    def __init__(self, ai_client: AIClient):
        self._client = ai_client

    def chat(self, messages, mode='coach'):
        system_prompt = coach_mode_registry.get_prompt(mode)
        return self._client.chat(MODEL, MAX_TOKENS, system_prompt, messages)


class CoachStreamService:
    """ISP: Handles only streaming interactions.
    DIP: Depends on AIClient abstraction, not a concrete implementation."""

    def __init__(self, ai_client: AIClient):
        self._client = ai_client

    def stream(self, messages, mode='coach'):
        system_prompt = coach_mode_registry.get_prompt(mode)
        return self._client.stream(MODEL, MAX_TOKENS, system_prompt, messages)


def get_ai_client():
    """Factory function for creating AI client instances."""
    return AnthropicAIClient()
