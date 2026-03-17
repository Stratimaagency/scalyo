from django.contrib import admin
from .models import KpiData


@admin.register(KpiData)
class KpiDataAdmin(admin.ModelAdmin):
    list_display = ['company', 'period', 'updated_at']
    list_filter = ['company']
