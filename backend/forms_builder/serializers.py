from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import DynamicForm, FormSubmission


class DynamicFormSerializer(serializers.ModelSerializer):
    """
    Serializer ADMIN — expose les statistiques de soumissions.
    À utiliser UNIQUEMENT pour les vues admin (IsStaffOrSuperuser).
    """
    themeColor = serializers.CharField(source='theme_color', required=False)
    isActive = serializers.BooleanField(source='is_active', required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    submissionsCount = serializers.SerializerMethodField()
    lastSubmissionAt = serializers.SerializerMethodField()
    hasNewSubmissions = serializers.SerializerMethodField()

    class Meta:
        model = DynamicForm
        fields = [
            'id', 'title', 'description', 'themeColor', 'isActive', 'createdAt', 'fields',
            'submissionsCount', 'lastSubmissionAt', 'hasNewSubmissions',
        ]

    def get_submissionsCount(self, obj):
        return obj.submissions.count()

    def get_lastSubmissionAt(self, obj):
        last = obj.submissions.order_by('-submitted_at').first()
        return last.submitted_at if last else None

    def get_hasNewSubmissions(self, obj):
        last = obj.submissions.order_by('-submitted_at').first()
        if not last:
            return False
        return (timezone.now() - last.submitted_at) < timedelta(hours=24)


class DynamicFormPublicSerializer(serializers.ModelSerializer):
    """
    Serializer PUBLIC — destiné aux visiteurs non authentifiés.
    N'expose PAS les statistiques de soumissions.
    """
    themeColor = serializers.CharField(source='theme_color', required=False)
    isActive = serializers.BooleanField(source='is_active', required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = DynamicForm
        fields = ['id', 'title', 'description', 'themeColor', 'isActive', 'createdAt', 'fields']


class FormSubmissionSerializer(serializers.ModelSerializer):
    formId = serializers.CharField(source='form_id')
    userId = serializers.CharField(source='user_id', allow_null=True)
    userName = serializers.CharField(source='user_name')
    userPhone = serializers.CharField(source='user_phone')
    submittedAt = serializers.DateTimeField(source='submitted_at')

    class Meta:
        model = FormSubmission
        fields = ['id', 'formId', 'userId', 'userName', 'userPhone', 'data', 'submittedAt']