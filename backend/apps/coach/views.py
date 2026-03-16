from django.http import StreamingHttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import CoachChatService, CoachStreamService, get_ai_client


class CoachChatView(APIView):
    """SRP: Handles synchronous chat requests only."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        messages = request.data.get('messages', [])
        mode = request.data.get('mode', 'coach')
        try:
            client = get_ai_client()
            service = CoachChatService(client)
            result = service.chat(messages, mode)
            return Response(result)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class CoachStreamView(APIView):
    """SRP: Handles streaming chat requests only."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        messages = request.data.get('messages', [])
        mode = request.data.get('mode', 'coach')
        try:
            client = get_ai_client()
            service = CoachStreamService(client)
            generator = service.stream(messages, mode)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        response = StreamingHttpResponse(generator, content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        return response
