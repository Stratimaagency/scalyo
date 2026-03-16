from django.contrib import admin
from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['user', 'category', 'rating', 'created_at']
    list_filter = ['category', 'rating']
