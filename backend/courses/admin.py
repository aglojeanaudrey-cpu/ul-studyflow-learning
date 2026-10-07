from django.contrib import admin
from .models import UE, Session, Chapter, Quiz, QuizQuestion, UserUEAccess, SessionProgress, QuizAttempt

class SessionInline(admin.TabularInline):
    model = Session
    extra = 1
    fields = ('session_number', 'title', 'estimated_minutes', 'order', 'is_published', 'is_suspended', 'is_locked_for_users')


class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 1
    fields = ('number', 'title', 'objectives', 'order')


@admin.register(UE)
class UEAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'department', 'level', 'semester', 'price_fcfa', 'is_published', 'is_suspended')
    list_filter = ('level', 'semester', 'is_published', 'is_suspended', 'department')
    search_fields = ('code', 'title', 'description')
    inlines = [SessionInline]


class QuizQuestionInline(admin.StackedInline):
    model = QuizQuestion
    extra = 1
    fields = ('text', 'question_type', 'options', 'correct_answer', 'explanation', 'points', 'order')


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'session', 'chapter', 'passing_score_percent')
    search_fields = ('title', 'session__title', 'chapter__title')
    inlines = [QuizQuestionInline]


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('session', 'number', 'title', 'order')
    list_filter = ('session__ue', 'session')
    search_fields = ('title', 'objectives', 'session__title')


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('ue', 'session_number', 'title', 'estimated_minutes', 'is_published', 'is_suspended', 'is_locked_for_users')
    list_filter = ('ue', 'is_published', 'is_suspended', 'is_locked_for_users')
    search_fields = ('title', 'description', 'ue__code', 'ue__title')
    inlines = [ChapterInline]


@admin.register(UserUEAccess)
class UserUEAccessAdmin(admin.ModelAdmin):
    list_display = ('user', 'ue', 'status', 'granted_at', 'expires_at', 'is_expired', 'days_remaining', 'granted_by')
    list_filter = ('status', 'ue')
    search_fields = ('user__phone', 'user__first_name', 'user__last_name', 'ue__code')


@admin.register(SessionProgress)
class SessionProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'session', 'ue', 'status', 'last_accessed_at', 'completed_at')
    list_filter = ('status', 'ue')
    search_fields = ('user__phone', 'user__first_name', 'session__title', 'ue__code')


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'session', 'score', 'max_score', 'percentage', 'passed', 'submitted_at')
    list_filter = ('passed', 'ue')
    search_fields = ('user__phone', 'user__first_name', 'quiz__title')
