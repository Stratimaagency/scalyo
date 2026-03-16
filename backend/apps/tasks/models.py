from django.db import models


class TaskBoard(models.Model):
    company = models.OneToOneField(
        'accounts.Company', on_delete=models.CASCADE, related_name='task_board'
    )
    tasks = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Tasks: {self.company.name}"
