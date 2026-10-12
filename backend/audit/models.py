import secrets
from django.db import models
from django.utils import timezone
from datetime import timedelta
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


class TrashBin(models.Model):
    """
    Corbeille générique pour les suppressions admin.

    Chaque entrée contient un snapshot JSON complet de l'objet supprimé
    + ses dépendances, permettant une restauration en cascade.

    Purge automatique après 30 jours.
    """

    OBJECT_TYPES = (
        ('ue', 'Unité d\'Enseignement'),
        ('session', 'Séance'),
        ('chapter', 'Chapitre'),
        ('user', 'Utilisateur'),
        ('popup', 'Publicité / Popup'),
        ('form', 'Formulaire'),
    )

    id = models.CharField(max_length=64, primary_key=True)

    # Type et ID de l'objet supprimé
    object_type = models.CharField(
        max_length=20,
        choices=OBJECT_TYPES,
        verbose_name="Type d'objet",
        db_index=True
    )
    object_id = models.CharField(
        max_length=64,
        verbose_name="ID de l'objet original",
        db_index=True
    )

    # Nom/titre lisible pour l'affichage dans la corbeille
    display_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Nom lisible"
    )

    # Snapshot complet (JSON)
    snapshot = models.JSONField(
        default=dict,
        verbose_name="Snapshot complet de l'objet + dépendances"
    )

    # Métadonnées
    deleted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='trash_deletions',
        verbose_name="Supprimé par"
    )
    deleted_by_phone = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Téléphone du suppresseur"
    )
    deleted_at = models.DateTimeField(
        default=timezone.now,
        verbose_name="Date de suppression",
        db_index=True
    )
    expires_at = models.DateTimeField(
        verbose_name="Date d'expiration (30 jours)",
        db_index=True
    )

    # Traçabilité
    deletion_reason = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Raison de suppression"
    )
    is_restored = models.BooleanField(
        default=False,
        verbose_name="A été restauré"
    )
    restored_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de restauration"
    )
    restored_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='trash_restorations',
        verbose_name="Restauré par"
    )

    class Meta:
        verbose_name = "Élément de la corbeille"
        verbose_name_plural = "Corbeille"
        ordering = ['-deleted_at']
        indexes = [
            models.Index(fields=['object_type', '-deleted_at']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['is_restored', '-deleted_at']),
        ]

    def __str__(self):
        return f"[{self.get_object_type_display()}] {self.display_name or self.object_id}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"trash_{int(timezone.now().timestamp())}_{secrets.token_hex(3)}"

        # Calcul automatique de l'expiration (30 jours)
        if not self.expires_at:
            self.expires_at = self.deleted_at + timedelta(days=30)

        super().save(*args, **kwargs)

    @property
    def days_remaining(self):
        """Nombre de jours restants avant purge."""
        delta = self.expires_at - timezone.now()
        return max(0, delta.days)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at