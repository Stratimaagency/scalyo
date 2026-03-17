from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Company, NotificationPreferences


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'display_name', 'role', 'company', 'is_active']
    list_filter = ['role', 'is_active']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Scalyo', {'fields': ('display_name', 'role', 'company', 'language', 'theme', 'currency')}),
    )


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan', 'arr', 'churn', 'nps']


@admin.register(NotificationPreferences)
class NotificationPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user', 'churn_alerts', 'weekly_report', 'wellbeing_alerts']
