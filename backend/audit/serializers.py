from rest_framework import serializers
from .models import AuditLog, TrashBin
from accounts.models import PartnershipRequest, ContactMessage

class AuditLogSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source='user_id', allow_null=True)
    userPhone = serializers.CharField(source='user_phone', allow_blank=True)
    userRole = serializers.CharField(source='user_role', allow_blank=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'timestamp', 'userId', 'userPhone', 'userRole', 'action', 'resource', 'details', 'ip']


class TrashBinSerializer(serializers.ModelSerializer):
    objectType = serializers.CharField(source='object_type')
    objectId = serializers.CharField(source='object_id')
    displayName = serializers.CharField(source='display_name')
    deletedByPhone = serializers.CharField(source='deleted_by_phone')
    deletedAt = serializers.DateTimeField(source='deleted_at')
    expiresAt = serializers.DateTimeField(source='expires_at')
    daysRemaining = serializers.SerializerMethodField()
    isRestored = serializers.BooleanField(source='is_restored')
    restoredAt = serializers.DateTimeField(source='restored_at', allow_null=True)
    deletionReason = serializers.CharField(source='deletion_reason')
    deletedByName = serializers.SerializerMethodField()
    restoredByName = serializers.SerializerMethodField()

    class Meta:
        model = TrashBin
        fields = [
            'id', 'objectType', 'objectId', 'displayName',
            'deletedByPhone', 'deletedAt', 'expiresAt', 'daysRemaining',
            'isRestored', 'restoredAt', 'deletionReason',
            'deletedByName', 'restoredByName',
        ]

    def get_daysRemaining(self, obj):
        return obj.days_remaining

    def get_deletedByName(self, obj):
        if obj.deleted_by:
            return f"{obj.deleted_by.first_name} {obj.deleted_by.last_name}"
        return obj.deleted_by_phone or 'Inconnu'

    def get_restoredByName(self, obj):
        if obj.restored_by:
            return f"{obj.restored_by.first_name} {obj.restored_by.last_name}"
        return None


class PartnershipRequestSerializer(serializers.ModelSerializer):
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    reviewed_by_phone = serializers.CharField(source='reviewed_by.phone', read_only=True)

    class Meta:
        model = PartnershipRequest
        fields = '__all__'


class ContactMessageSerializer(serializers.ModelSerializer):
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    handled_by_phone = serializers.CharField(source='handled_by.phone', read_only=True)

    class Meta:
        model = ContactMessage
        fields = '__all__'