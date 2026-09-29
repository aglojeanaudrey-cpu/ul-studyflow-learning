from django.contrib import admin
from .models import DynamicForm, FormSubmission

@admin.register(DynamicForm)
class DynamicFormAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'description')


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'user_phone', 'form', 'submitted_at')
    list_filter = ('form', 'submitted_at')
    search_fields = ('user_name', 'user_phone', 'form__title')
