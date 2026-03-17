from django.contrib import admin
from .models import CalendarEvents


@admin.register(CalendarEvents)
class CalendarEventsAdmin(admin.ModelAdmin):
    list_display = ['company', 'updated_at']
