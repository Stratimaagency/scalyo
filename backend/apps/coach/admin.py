from django.contrib import admin
from .models import CoachConversation


@admin.register(CoachConversation)
class CoachConversationAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
