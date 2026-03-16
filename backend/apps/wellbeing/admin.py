from django.contrib import admin
from .models import Wellbeing


@admin.register(Wellbeing)
class WellbeingAdmin(admin.ModelAdmin):
    list_display = ['company', 'score', 'burnout', 'charge']
