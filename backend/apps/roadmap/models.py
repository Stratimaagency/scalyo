from django.db import models


class Roadmap(models.Model):
    company = models.OneToOneField(
        'accounts.Company', on_delete=models.CASCADE, related_name='roadmap'
    )
    phase = models.CharField(max_length=255, default='Phase 1 — Launch')
    progress = models.IntegerField(default=0)
    items = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Roadmap: {self.company.name}"
