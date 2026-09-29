from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'action', 'resource', 'user_phone', 'user_role', 'ip')
    list_filter = ('action', 'user_role', 'timestamp')
    search_fields = ('action', 'resource', 'details', 'user_phone', 'ip')
    readonly_fields = ('timestamp', 'user', 'user_phone', 'user_role', 'action', 'resource', 'details', 'ip')
