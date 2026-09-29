from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source='user_id', allow_null=True)
    userPhone = serializers.CharField(source='user_phone', allow_blank=True)
    userRole = serializers.CharField(source='user_role', allow_blank=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'timestamp', 'userId', 'userPhone', 'userRole', 'action', 'resource', 'details', 'ip']
