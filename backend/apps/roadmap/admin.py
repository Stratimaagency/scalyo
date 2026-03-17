from django.contrib import admin
from .models import Roadmap


@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ['company', 'phase', 'progress']
