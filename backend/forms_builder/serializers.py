from rest_framework import serializers
from .models import DynamicForm, FormSubmission

class DynamicFormSerializer(serializers.ModelSerializer):
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
