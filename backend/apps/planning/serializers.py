from rest_framework import serializers
from .models import CalendarEvents


class CalendarEventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvents
        fields = ['id', 'events', 'updated_at']
        read_only_fields = ['id', 'updated_at']
