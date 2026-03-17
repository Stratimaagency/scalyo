from rest_framework import serializers
from .models import TaskBoard


class TaskBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskBoard
        fields = ['id', 'tasks', 'updated_at']
        read_only_fields = ['id', 'updated_at']
