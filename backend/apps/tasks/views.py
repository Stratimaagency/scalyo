from apps.core.views import singleton_get_save_views
from .models import TaskBoard
from .serializers import TaskBoardSerializer

task_list, task_save = singleton_get_save_views(TaskBoard, TaskBoardSerializer)
