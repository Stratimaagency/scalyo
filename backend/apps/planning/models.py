from django.db import models


class CalendarEvents(models.Model):
    company = models.OneToOneField(
        'accounts.Company', on_delete=models.CASCADE, related_name='calendar_events'
    )
    events = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'calendar events'

    def __str__(self):
        return f"Events: {self.company.name}"
