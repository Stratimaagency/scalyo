from django.contrib import admin
from .models import Account, AccountTodo


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'csm', 'arr', 'health', 'risk']
    list_filter = ['risk', 'company']
    search_fields = ['name', 'csm']


@admin.register(AccountTodo)
class AccountTodoAdmin(admin.ModelAdmin):
    list_display = ['account', 'text', 'done']
