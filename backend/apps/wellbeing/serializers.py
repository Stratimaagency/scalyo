from rest_framework import serializers
from .models import Wellbeing


class WellbeingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wellbeing
        fields = ['id', 'score', 'burnout', 'charge', 'trend', 'alerts', 'team', 'updated_at']
        read_only_fields = ['id', 'updated_at']
