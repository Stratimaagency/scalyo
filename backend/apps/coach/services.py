import json
from django.conf import settings


SYSTEM_PROMPTS = {
    'coach': (
        "Tu es un expert Customer Success senior avec 15 ans d'expérience. "
        "Tu conseilles des CS Managers et CSMs sur : stratégie CS, rétention, expansion, health scoring, "
        "QBR, onboarding, gestion d'équipe, prévention du churn, NPS, playbooks. "
        "Réponds de manière structurée, actionnable et bienveillante. Utilise la langue de l'utilisateur."
    ),
    'nova': (
        "Tu es Nova, assistante bien-être dédiée aux équipes Customer Success. "
        "Tu aides les CSMs à gérer le stress, la charge mentale, les conflits, l'épuisement professionnel. "
        "Tu es empathique, bienveillante et professionnelle. Tout est confidentiel. "
        "Réponds dans la langue de l'utilisateur."
    ),
}

MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 1024


def get_anthropic_client():
    """Factory for Anthropic client. Raises ValueError if key is missing."""
    api_key = settings.ANTHROPIC_API_KEY
    if not api_key:
        raise ValueError('ANTHROPIC_API_KEY is not configured.')
    import anthropic
    return anthropic.Anthropic(api_key=api_key)


def get_system_prompt(mode):
    return SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS['coach'])


class CoachService:
    """Handles AI coach interactions via Anthropic API."""

    @staticmethod
    def chat(messages, mode='coach'):
        client = get_anthropic_client()
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=get_system_prompt(mode),
            messages=messages,
        )
        return {
            'content': response.content[0].text,
            'role': 'assistant',
        }

    @staticmethod
    def stream(messages, mode='coach'):
        client = get_anthropic_client()
        system = get_system_prompt(mode)

        def event_generator():
            try:
                with client.messages.stream(
                    model=MODEL,
                    max_tokens=MAX_TOKENS,
                    system=system,
                    messages=messages,
                ) as stream:
                    for text in stream.text_stream:
                        yield f"data: {json.dumps({'text': text})}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return event_generator()
