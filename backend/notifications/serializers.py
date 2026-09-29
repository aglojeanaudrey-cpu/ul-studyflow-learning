from rest_framework import serializers
from .models import Notification, NotificationRecipientStatus
from accounts.models import User

class NotificationSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='notification_type')
    targetType = serializers.CharField(source='target_type')
    targetRole = serializers.CharField(source='target_role', allow_null=True, required=False)
    targetDepartment = serializers.CharField(source='target_department', allow_null=True, required=False)
    targetLevel = serializers.CharField(source='target_level', allow_null=True, required=False)
    actionUrl = serializers.CharField(source='action_url', allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', format='%Y-%m-%dT%H:%M:%SZ', read_only=True)
    scheduledFor = serializers.DateTimeField(source='scheduled_for', format='%Y-%m-%dT%H:%M:%SZ', allow_null=True, required=False)
    
    isRead = serializers.SerializerMethodField()
    readAt = serializers.SerializerMethodField()
    createdBy = serializers.SerializerMethodField()
    recipientsCount = serializers.SerializerMethodField()
    readCount = serializers.SerializerMethodField()
    recipientUserIds = serializers.SerializerMethodField()
    recipientNames = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'type',
            'priority',
            'targetType',
            'targetRole',
            'targetDepartment',
            'targetLevel',
            'status',
            'actionUrl',
            'createdAt',
            'scheduledFor',
            'isRead',
            'readAt',
            'createdBy',
            'recipientsCount',
            'readCount',
            'recipientUserIds',
            'recipientNames'
        ]

    def get_isRead(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        stat = obj.statuses.filter(user=request.user).first()
        return bool(stat and stat.is_read)

    def get_readAt(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        stat = obj.statuses.filter(user=request.user).first()
        if stat and stat.read_at:
            return stat.read_at.strftime('%Y-%m-%dT%H:%M:%SZ')
        return None

    def get_createdBy(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'name': f"{obj.created_by.first_name} {obj.created_by.last_name}",
                'role': obj.created_by.role
            }
        return {'id': 'system', 'name': 'Administration UL Study Flow', 'role': 'SUPERUSER'}

    def get_recipientsCount(self, obj):
        if obj.target_type == 'ALL':
            return User.objects.filter(is_active=True).count()
        elif obj.target_type == 'ROLE':
            return User.objects.filter(role=obj.target_role, is_active=True).count()
        elif obj.target_type == 'DEPARTMENT':
            return User.objects.filter(department=obj.target_department, is_active=True).count()
        elif obj.target_type == 'LEVEL':
            return User.objects.filter(level=obj.target_level, is_active=True).count()
        return obj.recipients.count()

    def get_readCount(self, obj):
        return obj.statuses.filter(is_read=True).count()

    def get_recipientUserIds(self, obj):
        if obj.target_type == 'USERS':
            return list(obj.recipients.values_list('id', flat=True))
        return []

    def get_recipientNames(self, obj):
        if obj.target_type == 'USERS':
            return [f"{u.first_name} {u.last_name} ({u.display_phone or u.phone})" for u in obj.recipients.all()[:5]]
        return []
