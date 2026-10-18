import secrets
from django.db import models
from django.utils import timezone
from accounts.models import User
from academic.models import Department, Program

class UE(models.Model):
    LEVEL_CHOICES = (
        ('L1', 'Licence 1'),
        ('L2', 'Licence 2'),
        ('L3', 'Licence 3'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    code = models.CharField(max_length=50, verbose_name="Code UE (ex: ECO-101)")
    title = models.CharField(max_length=255, verbose_name="Intitulé de l'UE")
    description = models.TextField(blank=True, verbose_name="Description détaillée")
    objective = models.TextField(blank=True, default="Objectif pédagogique général de l'UE.", verbose_name="Objectifs pédagogiques")
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='ues', verbose_name="Département")
    program = models.ForeignKey(Program, on_delete=models.SET_NULL, null=True, blank=True, related_name='ues', verbose_name="Filière")
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='L1', verbose_name="Niveau")
    semester = models.CharField(max_length=50, default="Semestre 1", verbose_name="Semestre")
    academic_year = models.CharField(max_length=50, default="2025-2026", verbose_name="Année académique")
    is_published = models.BooleanField(default=True, verbose_name="Publié")
    is_suspended = models.BooleanField(default=False, verbose_name="Suspendu")
    price_fcfa = models.IntegerField(default=500, verbose_name="Prix en FCFA")
    order = models.IntegerField(default=1, verbose_name="Ordre d'affichage")
    image_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="Image d'illustration")
    coefficient = models.IntegerField(default=2, verbose_name="Coefficient")
    credit_ects = models.IntegerField(default=4, verbose_name="Crédits ECTS")

    class Meta:
        verbose_name = "Unité d'Enseignement (UE)"
        verbose_name_plural = "Unités d'Enseignement (UE)"
        ordering = ['order', 'code']

    def __str__(self):
        return f"{self.code} - {self.title} ({self.level})"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"ue_{secrets.token_hex(4)}"
        super().save(*args, **kwargs)


class Session(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    ue = models.ForeignKey(UE, on_delete=models.CASCADE, related_name='sessions', verbose_name="UE parente")
    session_number = models.IntegerField(default=1, verbose_name="Numéro de séance")
    title = models.CharField(max_length=255, verbose_name="Titre de la séance")
    description = models.TextField(blank=True, verbose_name="Description brève")
    objective = models.TextField(blank=True, default="Objectif pédagogique de la séance.", verbose_name="Objectifs pédagogiques")
    estimated_minutes = models.IntegerField(default=45, verbose_name="Durée estimée (minutes)")
    order = models.IntegerField(default=1, verbose_name="Ordre dans l'UE")
    is_published = models.BooleanField(default=True, verbose_name="Publiée")
    is_suspended = models.BooleanField(default=False, verbose_name="Suspendue")

    # True = explicitement verrouillée, False = débloquée pour tous, None = règle par défaut (Séance 1 gratuite, reste sous réserve d'accès UE)
    is_locked_for_users = models.BooleanField(null=True, blank=True, default=None, verbose_name="Verrouillée pour étudiants simples")

    class Meta:
        verbose_name = "Séance de cours"
        verbose_name_plural = "Séances de cours"
        ordering = ['order', 'session_number']

    def __str__(self):
        return f"{self.ue.code} - Séance {self.session_number}: {self.title}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"sess_{secrets.token_hex(4)}"
        super().save(*args, **kwargs)


class Chapter(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='chapters', verbose_name="Séance parente")
    number = models.PositiveIntegerField(default=1, verbose_name="Numéro du chapitre")
    title = models.CharField(max_length=255, verbose_name="Titre du chapitre")
    objectives = models.TextField(blank=True, verbose_name="Objectifs pédagogiques du chapitre")
    order = models.IntegerField(default=1, verbose_name="Ordre dans la séance")

    # Contenu pédagogique
    summary_text = models.TextField(blank=True, verbose_name="Résumé / Cours écrit (legacy markdown)")
    summary_html = models.TextField(blank=True, verbose_name="Contenu riche HTML (TipTap)")
    summary_json = models.JSONField(default=dict, blank=True, verbose_name="Contenu riche JSON (TipTap)")
    # Styles appliqués par l'admin sur les blocs (images, tableaux, citations)
    # Format : { "blk_xxx": { "width": 80, "height": 60, "radius": 12, ... }, ... }
    summary_blocks_style = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Styles personnalisés des blocs (admin)"
    )

    video = models.JSONField(default=dict, blank=True, verbose_name="Métadonnées vidéo")
    audio = models.JSONField(default=dict, blank=True, verbose_name="Métadonnées podcast audio")
    pdf = models.JSONField(default=dict, blank=True, verbose_name="Métadonnées support PDF")
    flashcards = models.JSONField(default=list, blank=True, verbose_name="Cartes mémo (Flashcards)")

    class Meta:
        verbose_name = "Chapitre"
        verbose_name_plural = "Chapitres"
        ordering = ['order', 'number']

    @property
    def has_rich_content(self):
        """Vrai si le chapitre a du contenu riche TipTap."""
        return bool(self.summary_json and self.summary_json.get('content'))

    @property
    def effective_content(self):
        """Retourne le contenu à afficher (HTML prioritaire, fallback markdown)."""
        if self.summary_html:
            return self.summary_html
        return self.summary_text or ''

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"chap_{secrets.token_hex(4)}"
        super().save(*args, **kwargs)

class Quiz(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    session = models.OneToOneField(Session, on_delete=models.CASCADE, related_name='quiz', verbose_name="Séance associée", null=True, blank=True)
    chapter = models.OneToOneField(Chapter, on_delete=models.CASCADE, related_name='quiz', verbose_name="Chapitre associé", null=True, blank=True)
    title = models.CharField(max_length=255, verbose_name="Titre du questionnaire")
    description = models.TextField(blank=True, verbose_name="Consignes / Description")
    passing_score_percent = models.IntegerField(default=75, verbose_name="Score de validation (%)")

    class Meta:
        verbose_name = "Questionnaire interactif"
        verbose_name_plural = "Questionnaires interactifs"

    def __str__(self):
        target = self.chapter.title if self.chapter else (self.session.title if self.session else "Quiz")
        return f"Quiz : {self.title} ({target})"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"quiz_{secrets.token_hex(4)}"
        super().save(*args, **kwargs)


class QuizQuestion(models.Model):
    TYPE_CHOICES = (
        ('single', 'Choix unique'),
        ('multiple', 'Choix multiple'),
        ('boolean', 'Vrai / Faux'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions', verbose_name="Questionnaire")
    text = models.TextField(verbose_name="Énoncé de la question")
    question_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='single', verbose_name="Type de question")
    options = models.JSONField(default=list, verbose_name="Options de réponse")
    correct_answer = models.JSONField(default=list, verbose_name="Bonne(s) réponse(s)")
    explanation = models.TextField(blank=True, verbose_name="Explication pédagogique de la réponse")
    points = models.IntegerField(default=1, verbose_name="Points attribués")
    order = models.IntegerField(default=1, verbose_name="Ordre de la question")

    class Meta:
        verbose_name = "Question de quiz"
        verbose_name_plural = "Questions de quiz"
        ordering = ['order', 'id']

    def __str__(self):
        return f"Question: {self.text[:50]}..."

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"q_{secrets.token_hex(4)}"
        super().save(*args, **kwargs)


import datetime
import calendar


def compute_ue_expiration_date(start_date=None):
    """
    Calcule la date d'expiration exacte d'une UE débloquée :
    Exactement 6 mois et 10 jours à compter de la date de déblocage.
    """
    if start_date is None:
        start_date = timezone.now()

    year = start_date.year
    month = start_date.month + 6
    if month > 12:
        year += (month - 1) // 12
        month = ((month - 1) % 12) + 1

    max_day = calendar.monthrange(year, month)[1]
    day = min(start_date.day, max_day)

    date_plus_6m = start_date.replace(year=year, month=month, day=day)
    return date_plus_6m + datetime.timedelta(days=10)


class UserUEAccess(models.Model):
    STATUS_CHOICES = (
        ('active', 'Actif'),
        ('revoked', 'Révoqué'),
        ('expired', 'Expiré'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ue_accesses', verbose_name="Étudiant")
    ue = models.ForeignKey(UE, on_delete=models.CASCADE, related_name='user_accesses', verbose_name="UE accordée")
    granted_at = models.DateTimeField(default=timezone.now, verbose_name="Date d'attribution")
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'expiration (6 mois et 10 jours)")
    granted_by = models.CharField(max_length=100, default='system_registration', verbose_name="Accordé par")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Statut")
    is_first_chapter_only = models.BooleanField(default=False, verbose_name="Premier chapitre uniquement")

    class Meta:
        verbose_name = "Accès UE Étudiant"
        verbose_name_plural = "Accès UE Étudiants"
        unique_together = ('user', 'ue')

    def __str__(self):
        return f"{self.user.phone} -> {self.ue.code} ({self.status}) - Exp: {self.expires_at}"

    @property
    def is_expired(self):
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at

    @property
    def days_remaining(self):
        if not self.expires_at:
            return None
        delta = self.expires_at - timezone.now()
        return max(0, delta.days)

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"acc_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        if not self.expires_at and self.granted_at:
            self.expires_at = compute_ue_expiration_date(self.granted_at)
        super().save(*args, **kwargs)


class SessionProgress(models.Model):
    STATUS_CHOICES = (
        ('not_started', 'Non commencé'),
        ('in_progress', 'En cours'),
        ('completed', 'Validé / Terminé'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='session_progresses', verbose_name="Étudiant")
    session = models.ForeignKey(Session, on_delete=models.CASCADE, verbose_name="Séance")
    ue = models.ForeignKey(UE, on_delete=models.CASCADE, verbose_name="UE")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started', verbose_name="Statut d'avancement")
    last_accessed_at = models.DateTimeField(default=timezone.now, verbose_name="Dernier accès")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de complétion")

    class Meta:
        verbose_name = "Progression séance"
        verbose_name_plural = "Progressions séances"
        unique_together = ('user', 'session')

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.session.title} : {self.status}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"prog_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        super().save(*args, **kwargs)


class QuizAttempt(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts', verbose_name="Étudiant")
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, verbose_name="Questionnaire")
    session = models.ForeignKey(Session, on_delete=models.CASCADE, verbose_name="Séance")
    ue = models.ForeignKey(UE, on_delete=models.CASCADE, verbose_name="UE")
    score = models.IntegerField(verbose_name="Score obtenu")
    max_score = models.IntegerField(verbose_name="Score maximal")
    percentage = models.IntegerField(verbose_name="Pourcentage de réussite")
    passed = models.BooleanField(verbose_name="Test validé")
    user_answers = models.JSONField(default=dict, verbose_name="Réponses de l'étudiant")
    submitted_at = models.DateTimeField(default=timezone.now, verbose_name="Date de soumission")

    class Meta:
        verbose_name = "Tentative de questionnaire"
        verbose_name_plural = "Tentatives de questionnaire"
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user.phone} - {self.quiz.title}: {self.score}/{self.max_score} ({self.percentage}%)"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"att_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        super().save(*args, **kwargs)

class UEReview(models.Model):
    """Avis d'un étudiant sur une UE qu'il a terminée à 100%."""

    id = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ue_reviews',
        verbose_name="Étudiant"
    )
    ue = models.ForeignKey(
        UE,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name="UE évaluée"
    )
    rating = models.IntegerField(
        default=5,
        verbose_name="Note (1-5)",
        help_text="Note sur 5 étoiles"
    )
    comment = models.TextField(
        blank=True,
        verbose_name="Commentaire",
        help_text="Avis détaillé de l'étudiant"
    )
    is_visible = models.BooleanField(
        default=True,
        verbose_name="Visible publiquement"
    )
    # Marque si l'avis a été modéré (masqué par admin)
    moderation_reason = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Motif de modération"
    )

    created_at = models.DateTimeField(default=timezone.now, verbose_name="Date de publication")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Dernière modification")

    class Meta:
        verbose_name = "Avis sur UE"
        verbose_name_plural = "Avis sur UE"
        ordering = ['-created_at']
        # 1 seul avis par user par UE
        unique_together = ('user', 'ue')
        indexes = [
            models.Index(fields=['ue', '-created_at']),
            models.Index(fields=['ue', 'is_visible']),
        ]

    def __str__(self):
        return f"{self.user.phone} → {self.ue.code} ({self.rating}/5)"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"rev_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        # Clamp rating entre 1 et 5
        if self.rating < 1:
            self.rating = 1
        elif self.rating > 5:
            self.rating = 5
        super().save(*args, **kwargs)