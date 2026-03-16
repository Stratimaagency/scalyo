import json
from django.conf import settings
from django.http import StreamingHttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


SYSTEM_PROMPT_COACH = """Tu es un expert Customer Success senior avec 15 ans d'expérience.
Tu conseilles des CS Managers et CSMs sur : stratégie CS, rétention, expansion, health scoring,
QBR, onboarding, gestion d'équipe, prévention du churn, NPS, playbooks.
Réponds de manière structurée, actionnable et bienveillante. Utilise la langue de l'utilisateur."""

SYSTEM_PROMPT_NOVA = """Tu es Nova, assistante bien-être dédiée aux équipes Customer Success.
Tu aides les CSMs à gérer le stress, la charge mentale, les conflits, l'épuisement professionnel.
Tu es empathique, bienveillante et professionnelle. Tout est confidentiel.
Réponds dans la langue de l'utilisateur."""


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def coach_chat(request):
    api_key = settings.ANTHROPIC_API_KEY
    if not api_key:
        return Response({'error': 'API key not configured'}, status=400)

    messages = request.data.get('messages', [])
    mode = request.data.get('mode', 'coach')  # 'coach' or 'nova'
    system = SYSTEM_PROMPT_NOVA if mode == 'nova' else SYSTEM_PROMPT_COACH

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=system,
            messages=messages,
        )
        return Response({
            'content': response.content[0].text,
            'role': 'assistant',
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def coach_stream(request):
    api_key = settings.ANTHROPIC_API_KEY
    if not api_key:
        return Response({'error': 'API key not configured'}, status=400)

    messages = request.data.get('messages', [])
    mode = request.data.get('mode', 'coach')
    system = SYSTEM_PROMPT_NOVA if mode == 'nova' else SYSTEM_PROMPT_COACH

    def event_stream():
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            with client.messages.stream(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=system,
                messages=messages,
            ) as stream:
                for text in stream.text_stream:
                    yield f"data: {json.dumps({'text': text})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response
