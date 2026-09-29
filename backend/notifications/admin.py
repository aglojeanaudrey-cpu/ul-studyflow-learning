from django.contrib import admin
from .models import Notification, NotificationRecipientStatus

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'notification_type', 'target_type', 'status', 'scheduled_for', 'created_at')
    list_filter = ('notification_type', 'target_type', 'status', 'priority')
    search_fields = ('title', 'message')
    ordering = ('-created_at',)

@admin.register(NotificationRecipientStatus)
class NotificationRecipientStatusAdmin(admin.ModelAdmin):
    list_display = ('notification', 'user', 'is_read', 'read_at', 'created_at')
    list_filter = ('is_read',)
    search_fields = ('user__phone', 'user__first_name', 'user__last_name', 'notification__title')
