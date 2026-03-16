from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import TaskBoard
from .serializers import TaskBoardSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_list(request):
    company = request.user.company
    if not company:
        return Response({'tasks': []})
    board, _ = TaskBoard.objects.get_or_create(company=company)
    return Response(TaskBoardSerializer(board).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def task_save(request):
    company = request.user.company
    board, _ = TaskBoard.objects.get_or_create(company=company)
    board.tasks = request.data.get('tasks', [])
    board.save()
    return Response(TaskBoardSerializer(board).data)
