from rest_framework import serializers
from .models import Roadmap


class RoadmapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roadmap
        fields = ['id', 'phase', 'progress', 'items', 'updated_at']
        read_only_fields = ['id', 'updated_at']
