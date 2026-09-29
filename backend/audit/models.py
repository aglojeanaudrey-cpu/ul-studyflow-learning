import secrets
from django.db import models
from django.utils import timezone
from accounts.models import User

class AuditLog(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    timestamp = models.DateTimeField(default=timezone.now, verbose_name="Horodatage")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs', verbose_name="Utilisateur")
    user_phone = models.CharField(max_length=50, blank=True, verbose_name="Téléphone de l'utilisateur")
    user_role = models.CharField(max_length=30, blank=True, verbose_name="Rôle au moment de l'action")
    action = models.CharField(max_length=100, verbose_name="Action effectuée")
    resource = models.CharField(max_length=100, verbose_name="Ressource concernée")
    details = models.TextField(verbose_name="Détails de l'opération")
    ip = models.CharField(max_length=50, blank=True, verbose_name="Adresse IP")

    class Meta:
        verbose_name = "Journal d'audit"
        verbose_name_plural = "Journaux d'audit"
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%d/%m/%Y %H:%M')}] {self.action} par {self.user_phone or 'Anonyme'}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"aud_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        super().save(*args, **kwargs)
