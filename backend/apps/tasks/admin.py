from django.contrib import admin
from .models import TaskBoard


@admin.register(TaskBoard)
class TaskBoardAdmin(admin.ModelAdmin):
    list_display = ['company', 'updated_at']
