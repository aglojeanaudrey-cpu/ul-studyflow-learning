from rest_framework import serializers
from .models import UE, Session, Quiz, QuizQuestion, UserUEAccess, SessionProgress, QuizAttempt

class QuizQuestionSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='question_type')
    correctAnswer = serializers.JSONField(source='correct_answer', required=False)

    class Meta:
        model = QuizQuestion
        fields = ['id', 'text', 'type', 'options', 'correctAnswer', 'explanation', 'points', 'order']


class QuizSerializer(serializers.ModelSerializer):
    sessionId = serializers.CharField(source='session_id')
    passingScorePercent = serializers.IntegerField(source='passing_score_percent')
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'sessionId', 'title', 'description', 'passingScorePercent', 'questions']


class SessionContentSerializer(serializers.Serializer):
    summaryText = serializers.CharField(source='summary_text', allow_blank=True, default='')
    video = serializers.DictField(required=False, allow_null=True)
    audio = serializers.DictField(required=False, allow_null=True)
    pdf = serializers.DictField(required=False, allow_null=True)


class SessionSerializer(serializers.ModelSerializer):
    ueId = serializers.CharField(source='ue_id')
    sessionNumber = serializers.IntegerField(source='session_number')
    estimatedMinutes = serializers.IntegerField(source='estimated_minutes')
    isPublished = serializers.BooleanField(source='is_published')
    isSuspended = serializers.BooleanField(source='is_suspended', required=False)
    isLockedForUsers = serializers.BooleanField(source='is_locked_for_users', required=False, allow_null=True)
    content = serializers.SerializerMethodField()
    quiz = QuizSerializer(read_only=True)
    hasQuiz = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    isFreeChapter = serializers.SerializerMethodField()
    isLocked = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            'id', 'ueId', 'sessionNumber', 'title', 'description', 'objective',
            'estimatedMinutes', 'order', 'isPublished', 'isSuspended', 'isLockedForUsers',
            'content', 'quiz', 'flashcards', 'hasQuiz', 'status', 'isFreeChapter', 'isLocked'
        ]

    def get_content(self, obj):
        return {
            'summaryText': obj.summary_text or '',
            'video': obj.video or None,
            'audio': obj.audio or None,
            'pdf': obj.pdf or None
        }

    def get_hasQuiz(self, obj):
        return hasattr(obj, 'quiz') and obj.quiz is not None

    def get_status(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            prog = SessionProgress.objects.filter(user=request.user, session=obj).first()
            if prog:
                return prog.status
        return 'not_started'

    def get_isFreeChapter(self, obj):
        return obj.session_number == 1

    def get_isLocked(self, obj):
        if obj.session_number == 1:
            return False
        request = self.context.get('request')
        user = request.user if request and request.user and request.user.is_authenticated else None
        if user:
            if user.role in ('SUPERUSER', 'STAFF') or user.is_superuser or user.is_staff or user.is_sponsored:
                return False
            # Explicit unlock by staff
            if obj.is_locked_for_users is False:
                return False
            if obj.is_locked_for_users is True:
                return True
            # Default: unlocked if student has active access to parent UE
            has_access = UserUEAccess.objects.filter(user=user, ue=obj.ue, status='active').exists()
            return not has_access
        return True


class UESerializer(serializers.ModelSerializer):
    departmentId = serializers.CharField(source='department_id', allow_null=True, required=False)
    programId = serializers.CharField(source='program_id', allow_null=True, required=False)
    academicYear = serializers.CharField(source='academic_year')
    isPublished = serializers.BooleanField(source='is_published')
    isSuspended = serializers.BooleanField(source='is_suspended', required=False)
    priceFcfa = serializers.IntegerField(source='price_fcfa')
    imageUrl = serializers.URLField(source='image_url', allow_null=True, required=False)
    creditEcts = serializers.IntegerField(source='credit_ects', required=False)
    departmentName = serializers.SerializerMethodField()
    programName = serializers.SerializerMethodField()
    sessionsCount = serializers.SerializerMethodField()
    completedSessionsCount = serializers.SerializerMethodField()
    progressPercent = serializers.SerializerMethodField()
    isUnlocked = serializers.SerializerMethodField()

    class Meta:
        model = UE
        fields = [
            'id', 'code', 'title', 'description', 'objective', 'departmentId',
            'programId', 'level', 'semester', 'academicYear', 'isPublished',
            'isSuspended', 'priceFcfa', 'order', 'imageUrl', 'coefficient',
            'creditEcts', 'departmentName', 'programName', 'sessionsCount',
            'completedSessionsCount', 'progressPercent', 'isUnlocked'
        ]

    def get_departmentName(self, obj):
        return obj.department.name if obj.department else (obj.department_id or '')

    def get_programName(self, obj):
        return obj.program.name if obj.program else (obj.program_id or '')

    def get_sessionsCount(self, obj):
        return obj.sessions.filter(is_published=True, is_suspended=False).count()

    def get_completedSessionsCount(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            sess_ids = obj.sessions.filter(is_published=True, is_suspended=False).values_list('id', flat=True)
            return SessionProgress.objects.filter(user=request.user, session_id__in=sess_ids, status='completed').count()
        return 0

    def get_progressPercent(self, obj):
        total = self.get_sessionsCount(obj)
        if total == 0:
            return 0
        completed = self.get_completedSessionsCount(obj)
        return min(100, round((completed / total) * 100))

    def get_isUnlocked(self, obj):
        request = self.context.get('request')
        user = request.user if request and request.user and request.user.is_authenticated else None
        if not user:
            return False
        if user.role in ('SUPERUSER', 'STAFF') or user.is_superuser or user.is_staff or user.is_sponsored:
            return True
        return UserUEAccess.objects.filter(user=user, ue=obj, status='active').exists()


class QuizAttemptSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source='user_id')
    quizId = serializers.CharField(source='quiz_id')
    sessionId = serializers.CharField(source='session_id')
    ueId = serializers.CharField(source='ue_id')
    maxScore = serializers.IntegerField(source='max_score')
    userAnswers = serializers.JSONField(source='user_answers')
    submittedAt = serializers.DateTimeField(source='submitted_at')

    class Meta:
        model = QuizAttempt
        fields = ['id', 'userId', 'quizId', 'sessionId', 'ueId', 'score', 'maxScore', 'percentage', 'passed', 'userAnswers', 'submittedAt']
