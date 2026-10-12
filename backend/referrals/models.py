import secrets
import string
from django.db import models
from django.utils import timezone
from datetime import timedelta
from accounts.models import User


def generate_referral_code(first_name: str) -> str:
    """Génère un code unique basé sur le prénom + chiffres (ex: YAWO123)."""
    # Nettoyer le prénom : garder uniquement les lettres, uppercase
    clean = ''.join(c for c in first_name.upper() if c.isalpha())
    prefix = (clean[:6] or 'USER')

    # Chercher un code unique
    for _ in range(20):
        suffix = ''.join(secrets.choice(string.digits) for _ in range(3))
        code = f"{prefix}{suffix}"
        if not ReferralCode.objects.filter(code=code).exists():
            return code

    # Fallback aléatoire
    return 'REF' + ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))


class ReferralCode(models.Model):
    """Code de parrainage unique par utilisateur."""

    id = models.CharField(max_length=64, primary_key=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='referral_code',
        verbose_name="Utilisateur"
    )
    code = models.CharField(max_length=20, unique=True, verbose_name="Code de parrainage", db_index=True)

    # Compteurs dénormalisés (mise à jour à chaque validation)
    total_referrals = models.IntegerField(default=0, verbose_name="Total parrainages (tous statuts)")
    validated_referrals = models.IntegerField(default=0, verbose_name="Parrainages validés")

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Code de parrainage"
        verbose_name_plural = "Codes de parrainage"

    def __str__(self):
        return f"{self.code} ({self.user.phone})"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"rc_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        if not self.code:
            self.code = generate_referral_code(self.user.first_name)
        super().save(*args, **kwargs)

    def get_next_milestone(self):
        """Retourne le prochain palier à atteindre."""
        count = self.validated_referrals
        if count < 1:
            return {'threshold': 1, 'reward': 'discount_10', 'label': 'Code -10% sur une UE'}
        if count < 3:
            return {'threshold': 3, 'reward': 'discount_20', 'label': 'Code -20% sur une UE'}
        if count < 5:
            return {'threshold': 5, 'reward': 'free_ue', 'label': '1 UE offerte au choix'}
        if count < 25:
            return {'threshold': 25, 'reward': 'sponsored_1m', 'label': '1 mois sponsorisé (accès total)'}
        return None  # Plus de palier


class Referral(models.Model):
    """Relation entre un parrain et un filleul."""

    STATUS_CHOICES = (
        ('pending', 'En attente de validation'),
        ('validated', 'Validé (filleul a débloqué)'),
        ('expired', 'Expiré (1 mois dépassé)'),
        ('rejected', 'Rejeté (triche ou invalide)'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    referrer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='referrals_sent',
        verbose_name="Parrain"
    )
    referee = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='referral_received',
        verbose_name="Filleul"
    )
    referral_code = models.CharField(max_length=20, verbose_name="Code utilisé")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Statut")

    created_at = models.DateTimeField(default=timezone.now, verbose_name="Date d'inscription du filleul")
    expires_at = models.DateTimeField(verbose_name="Date d'expiration (1 mois après inscription)")
    validated_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de validation")
    rejection_reason = models.CharField(max_length=255, blank=True, verbose_name="Motif de rejet")

    # Métadonnées de validation
    validation_reason = models.CharField(max_length=255, blank=True, verbose_name="Raison de la validation (ex: déblocage UE ECO-101)")

    class Meta:
        verbose_name = "Parrainage"
        verbose_name_plural = "Parrainages"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['referrer', 'status']),
            models.Index(fields=['referee']),
            models.Index(fields=['status', 'expires_at']),
        ]
        # Un filleul ne peut être parrainé qu'une seule fois
        constraints = [
            models.UniqueConstraint(fields=['referee'], name='unique_referee')
        ]

    def __str__(self):
        return f"{self.referrer.phone} → {self.referee.phone} [{self.status}]"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"ref_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        if not self.expires_at:
            # Expire 1 mois après l'inscription du filleul
            self.expires_at = self.created_at + timedelta(days=30)
        super().save(*args, **kwargs)

    def is_expired(self):
        """Vérifie si le parrainage a expiré (1 mois dépassé)."""
        if self.status != 'pending':
            return False
        return timezone.now() > self.expires_at

    def mark_as_expired(self):
        """Marque ce parrainage comme expiré."""
        if self.status == 'pending':
            self.status = 'expired'
            self.save(update_fields=['status'])


class ReferralReward(models.Model):
    """Historique des récompenses débloquées par un parrain."""

    REWARD_TYPES = (
        ('discount_10', 'Code -10% sur une UE'),
        ('discount_20', 'Code -20% sur une UE'),
        ('free_ue', '1 UE offerte au choix'),
        ('sponsored_1m', '1 mois sponsorisé (accès total gratuit)'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='referral_rewards',
        verbose_name="Bénéficiaire"
    )
    reward_type = models.CharField(max_length=30, choices=REWARD_TYPES, verbose_name="Type de récompense")
    milestone = models.IntegerField(verbose_name="Palier atteint (nombre de parrainages)")

    # Lien vers le code promo créé (pour discount_10, discount_20, free_ue)
    promo_code = models.CharField(max_length=50, blank=True, null=True, verbose_name="Code promo généré")

    granted_at = models.DateTimeField(default=timezone.now, verbose_name="Date d'obtention")

    # Validité du code promo (discount_10, discount_20, free_ue)
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'expiration du code")
    is_used = models.BooleanField(default=False, verbose_name="Utilisé")
    used_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'utilisation")

    # Sponsorisation MANUELLE (uniquement pour reward_type='sponsored_1m')
    # L'utilisateur doit cliquer sur "Activer" pour lancer sa sponsorisation
    is_activated = models.BooleanField(
        default=False,
        verbose_name="Activée manuellement par l'utilisateur"
    )
    activated_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name="Date d'activation de la sponsorisation"
    )
    sponsorship_expires_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name="Date d'expiration de la sponsorisation (30 jours après activation)"
    )

    class Meta:
        verbose_name = "Récompense de parrainage"
        verbose_name_plural = "Récompenses de parrainage"
        ordering = ['-granted_at']

    def __str__(self):
        return f"{self.user.phone} - {self.get_reward_type_display()} (palier {self.milestone})"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"rw_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        super().save(*args, **kwargs)

    @property
    def is_sponsorship_active(self):
        """La sponsorisation est-elle actuellement active ?"""
        if self.reward_type != 'sponsored_1m':
            return False
        if not self.is_activated:
            return False
        if not self.sponsorship_expires_at:
            return False
        return timezone.now() < self.sponsorship_expires_at

    @property
    def days_remaining_sponsorship(self):
        """Nombre de jours restants pour la sponsorisation."""
        if not self.is_sponsorship_active:
            return 0
        delta = self.sponsorship_expires_at - timezone.now()
        return max(0, delta.days)