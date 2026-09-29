import secrets
from django.db import models
from django.utils import timezone
from accounts.models import User

class Notification(models.Model):
    TYPE_CHOICES = (
        ('info', 'Information'),
        ('warning', 'Avertissement'),
        ('success', 'Succès'),
        ('alert', 'Alerte Urgente'),
        ('reminder', 'Rappel Pédagogique'),
    )

    PRIORITY_CHOICES = (
        ('low', 'Basse'),
        ('normal', 'Normale'),
        ('high', 'Haute / Urgente'),
    )

    TARGET_CHOICES = (
        ('ALL', 'Tous les utilisateurs'),
        ('USERS', 'Utilisateurs spécifiques'),
        ('ROLE', 'Par Rôle'),
        ('DEPARTMENT', 'Par Département / Faculté'),
        ('LEVEL', 'Par Niveau LMD'),
    )

    STATUS_CHOICES = (
        ('DRAFT', 'Brouillon'),
        ('SCHEDULED', 'Programmé'),
        ('SENT', 'Envoyé'),
        ('CANCELLED', 'Annulé'),
    )

    id = models.CharField(max_length=64, primary_key=True, default='')
    title = models.CharField(max_length=200, verbose_name="Titre de la notification")
    message = models.TextField(verbose_name="Message / Contenu")
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='info', verbose_name="Type")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal', verbose_name="Priorité")
    
    target_type = models.CharField(max_length=30, choices=TARGET_CHOICES, default='ALL', verbose_name="Cible")
    target_role = models.CharField(max_length=30, blank=True, null=True, verbose_name="Rôle ciblé")
    target_department = models.CharField(max_length=120, blank=True, null=True, verbose_name="Département ciblé")
    target_level = models.CharField(max_length=20, blank=True, null=True, verbose_name="Niveau ciblé")
    
    recipients = models.ManyToManyField(User, blank=True, related_name='received_notifications', verbose_name="Destinataires ciblés")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_notifications', verbose_name="Auteur")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Date de création")
    scheduled_for = models.DateTimeField(null=True, blank=True, verbose_name="Date & Heure programmée d'envoi")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SENT', verbose_name="Statut")
    action_url = models.CharField(max_length=255, blank=True, null=True, verbose_name="Lien d'action interne")

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_notification_type_display()}] {self.title} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"notif_{int(timezone.now().timestamp())}_{secrets.token_hex(3)}"
        
        # Determine status according to scheduled_for
        if self.scheduled_for and self.scheduled_for > timezone.now():
            if self.status != 'CANCELLED' and self.status != 'DRAFT':
                self.status = 'SCHEDULED'
        elif self.status == 'SCHEDULED' and (not self.scheduled_for or self.scheduled_for <= timezone.now()):
            self.status = 'SENT'

        super().save(*args, **kwargs)

    def is_visible_now(self):
        if self.status == 'CANCELLED' or self.status == 'DRAFT':
            return False
        if self.scheduled_for and self.scheduled_for > timezone.now():
            return False
        return True


class NotificationRecipientStatus(models.Model):
    """Suit l'état de lecture par utilisateur pour chaque notification."""
    id = models.CharField(max_length=64, primary_key=True, default='')
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='statuses', verbose_name="Notification")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_statuses', verbose_name="Utilisateur")
    is_read = models.BooleanField(default=False, verbose_name="Lu")
    read_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de lecture")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "État de lecture"
        verbose_name_plural = "États de lecture"
        unique_together = ('notification', 'user')

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"nstat_{int(timezone.now().timestamp())}_{secrets.token_hex(3)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.phone} - {self.notification.title} ({'Lu' if self.is_read else 'Non lu'})"
