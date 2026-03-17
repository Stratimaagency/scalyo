from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Feedback
from .serializers import FeedbackSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def feedback_create(request):
    serializer = FeedbackSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
