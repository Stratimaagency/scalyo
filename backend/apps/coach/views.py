from django.http import StreamingHttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .services import CoachService


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def coach_chat(request):
    messages = request.data.get('messages', [])
    mode = request.data.get('mode', 'coach')
    try:
        result = CoachService.chat(messages, mode)
        return Response(result)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def coach_stream(request):
    messages = request.data.get('messages', [])
    mode = request.data.get('mode', 'coach')
    try:
        generator = CoachService.stream(messages, mode)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)
    response = StreamingHttpResponse(generator, content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response
