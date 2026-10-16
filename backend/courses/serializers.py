from rest_framework import serializers
from .models import UE, Session, Chapter, Quiz, QuizQuestion, UserUEAccess, SessionProgress, QuizAttempt, UEReview

class QuizQuestionSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='question_type')
    correctAnswer = serializers.JSONField(source='correct_answer', required=False)

    class Meta:
        model = QuizQuestion
        fields = ['id', 'text', 'type', 'options', 'correctAnswer', 'explanation', 'points', 'order']


class QuizSerializer(serializers.ModelSerializer):
    sessionId = serializers.CharField(source='session_id', allow_null=True, required=False)
    chapterId = serializers.CharField(source='chapter_id', allow_null=True, required=False)
    passingScorePercent = serializers.IntegerField(source='passing_score_percent')
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'sessionId', 'chapterId', 'title', 'description', 'passingScorePercent', 'questions']

class ChapterSerializer(serializers.ModelSerializer):
    """
    Serializer du chapitre avec masquage des URLs médias protégées.

    ⭐ Sécurité : si le média est hébergé sur Cloudinary en mode
    'authenticated', on N'EXPOSE PAS son URL brute. Le frontend devra
    appeler POST /api/chapters/<id>/secure-video-url pour obtenir
    une URL signée temporaire (avec watermark + expiration).
    """

    video = serializers.SerializerMethodField()
    audio = serializers.SerializerMethodField()
    pdf = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = '__all__'

    # ─────────────────────────────────────────────────────────
    # Helpers internes
    # ─────────────────────────────────────────────────────────

    def _is_protected(self, media: dict) -> bool:
        """Détecte si un média est protégé (Cloudinary authenticated)."""
        if not isinstance(media, dict):
            return False
        # Cas 1 : flag explicite
        if media.get('isProtected') is True:
            return True
        # Cas 2 : type authenticated
        if media.get('type') == 'authenticated':
            return True
        # Cas 3 : présent avec un public_id mais pas d'URL exploitable
        #          ET provider cloudinary
        if (
            media.get('public_id')
            and media.get('provider') == 'cloudinary'
            and not media.get('url')
        ):
            return True
        return False

    def _sanitize_media(self, media, kind: str) -> dict:
        """
        Nettoie un média avant exposition :
        - Si protégé : garde les métadonnées publiques (title, duration,
          thumbnail, etc.) mais masque url + public_id.
        - Sinon : retourne tel quel.
        """
        if not isinstance(media, dict) or not media:
            return {}

        if self._is_protected(media):
            safe = {
                'title': media.get('title'),
                'duration': media.get('duration'),
                'provider': 'cloudinary',
                'isProtected': True,
                # ⭐ On masque ces 2 champs critiques
                'url': None,
                'public_id': None,
            }
            # Métadonnées spécifiques
            if kind == 'video':
                safe['thumbnail_url'] = media.get('thumbnail_url')
            elif kind == 'audio':
                safe['speaker'] = media.get('speaker')
            elif kind == 'pdf':
                safe['pages'] = media.get('pages')
                safe['sizeMb'] = media.get('sizeMb') or media.get('size_mb')
            return safe

        # Média non protégé → tel quel (YouTube, URL externe, etc.)
        return media

    # ─────────────────────────────────────────────────────────
    # Champs
    # ─────────────────────────────────────────────────────────

    def get_video(self, obj):
        return self._sanitize_media(obj.video, 'video')

    def get_audio(self, obj):
        return self._sanitize_media(obj.audio, 'audio')

    def get_pdf(self, obj):
        return self._sanitize_media(obj.pdf, 'pdf')



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
    chapters = ChapterSerializer(many=True, read_only=True)
    chaptersCount = serializers.SerializerMethodField()
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
            'chapters', 'chaptersCount', 'quiz', 'hasQuiz', 'status', 'isFreeChapter', 'isLocked'
        ]

    def get_chaptersCount(self, obj):
        return obj.chapters.count()

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
            # Default: unlocked if student has active non-expired access to parent UE
            access = UserUEAccess.objects.filter(user=user, ue=obj.ue, status='active').first()
            if access and not access.is_expired:
                return False
            return True
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
    expiresAt = serializers.SerializerMethodField()
    isExpired = serializers.SerializerMethodField()
    daysRemaining = serializers.SerializerMethodField()
    accessGrantedAt = serializers.SerializerMethodField()
    reviewsCount = serializers.SerializerMethodField()
    averageRating = serializers.SerializerMethodField()

    class Meta:
        model = UE
        fields = [
            'id', 'code', 'title', 'description', 'objective', 'departmentId',
            'programId', 'level', 'semester', 'academicYear', 'isPublished',
            'isSuspended', 'priceFcfa', 'order', 'imageUrl', 'coefficient',
            'creditEcts', 'departmentName', 'programName', 'sessionsCount',
            'completedSessionsCount', 'progressPercent', 'isUnlocked',
            'expiresAt', 'isExpired', 'daysRemaining', 'accessGrantedAt',
            'reviewsCount', 'averageRating'
        ]

    def _get_user_access(self, obj):
        request = self.context.get('request')
        user = request.user if request and request.user and request.user.is_authenticated else None
        if not user:
            return None
        if not hasattr(self, '_access_cache'):
            self._access_cache = {}
        if obj.id not in self._access_cache:
            self._access_cache[obj.id] = UserUEAccess.objects.filter(user=user, ue=obj).first()
        return self._access_cache[obj.id]

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
        access = self._get_user_access(obj)
        if access and access.status == 'active' and not access.is_expired:
            return True
        return False

    def get_expiresAt(self, obj):
        access = self._get_user_access(obj)
        if access and access.expires_at:
            return access.expires_at.isoformat()
        return None

    def get_isExpired(self, obj):
        access = self._get_user_access(obj)
        if access:
            return access.is_expired
        return False

    def get_daysRemaining(self, obj):
        access = self._get_user_access(obj)
        if access and access.expires_at:
            return access.days_remaining
        return None

    def get_accessGrantedAt(self, obj):
        access = self._get_user_access(obj)
        if access and access.granted_at:
            return access.granted_at.isoformat()
        return None

    def get_reviewsCount(self, obj):
        return obj.reviews.filter(is_visible=True).count()

    def get_averageRating(self, obj):
        from django.db.models import Avg
        result = obj.reviews.filter(is_visible=True).aggregate(avg=Avg('rating'))
        avg = result.get('avg')
        return round(avg, 2) if avg else None


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


class UEReviewSerializer(serializers.ModelSerializer):
    userName = serializers.SerializerMethodField()
    userPhone = serializers.SerializerMethodField()
    userLevel = serializers.SerializerMethodField()
    userDepartment = serializers.SerializerMethodField()
    ueCode = serializers.CharField(source='ue.code', read_only=True)
    ueTitle = serializers.CharField(source='ue.title', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = UEReview
        fields = [
            'id', 'ue', 'user', 'rating', 'comment', 'is_visible',
            'created_at', 'updated_at', 'createdAt',
            'userName', 'userPhone', 'userLevel', 'userDepartment',
            'ueCode', 'ueTitle',
        ]
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def get_userName(self, obj):
        # Format "Kodjo M." pour la confidentialité
        if obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name[0]}."
        return obj.user.first_name

    def get_userPhone(self, obj):
        return obj.user.display_phone or obj.user.phone

    def get_userLevel(self, obj):
        return obj.user.level

    def get_userDepartment(self, obj):
        return obj.user.department