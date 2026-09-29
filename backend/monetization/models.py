import secrets
from django.db import models
from django.utils import timezone
from accounts.models import User

class PromoCode(models.Model):
    APPLICABLE_CHOICES = (
        ('all', 'Toutes les prestations'),
        ('ue_unlock', 'Déblocage UE uniquement'),
        ('tutoring', 'Assistance tutorat'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    code = models.CharField(max_length=50, unique=True, verbose_name="Code promo (ex: REUSSITE20)")
    discount_percent = models.IntegerField(default=10, verbose_name="Pourcentage de réduction (%)")
    applicable_to = models.CharField(max_length=30, choices=APPLICABLE_CHOICES, default='all', verbose_name="Applicable à")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Date de création")
    created_by = models.CharField(max_length=100, blank=True, verbose_name="Créé par")

    class Meta:
        verbose_name = "Code promotionnel"
        verbose_name_plural = "Codes promotionnels"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} (-{self.discount_percent}%)"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"promo_{secrets.token_hex(4)}"
        self.code = self.code.strip().upper()
        super().save(*args, **kwargs)


class UnlockRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('approved', 'Approuvée (Accès accordés)'),
        ('rejected', 'Refusée'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='unlock_requests', verbose_name="Étudiant")
    user_name = models.CharField(max_length=150, verbose_name="Nom et Prénom")
    user_phone = models.CharField(max_length=50, verbose_name="Numéro de paiement")
    ue_ids = models.JSONField(default=list, verbose_name="IDs des UE demandées")
    ue_codes = models.JSONField(default=list, verbose_name="Codes des UE demandées")
    promo_code = models.CharField(max_length=50, blank=True, null=True, verbose_name="Code promo utilisé")
    discount_percent = models.IntegerField(null=True, blank=True, verbose_name="Réduction appliquée (%)")
    subtotal_fcfa = models.IntegerField(default=0, verbose_name="Sous-total (FCFA)")
    transaction_fee_fcfa = models.IntegerField(default=100, verbose_name="Frais de transaction (FCFA)")
    total_fcfa = models.IntegerField(default=100, verbose_name="Montant total (FCFA)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Statut de la demande")
    payment_method = models.CharField(max_length=100, default="Mix Togo / Flooz Togo", verbose_name="Moyen de paiement")
    notes = models.TextField(blank=True, verbose_name="Remarques / Motif de rejet")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Date de demande")
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'examen")
    reviewed_by = models.CharField(max_length=100, blank=True, verbose_name="Examiné par")

    class Meta:
        verbose_name = "Demande de déblocage d'UE"
        verbose_name_plural = "Demandes de déblocage d'UE"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user_name} ({', '.join(self.ue_codes)}) - {self.total_fcfa} FCFA [{self.status}]"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"req_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        super().save(*args, **kwargs)


class PlatformConfig(models.Model):
    """Configuration globale de la plateforme, tarifs et numéros de contact."""
    default_ue_price_fcfa = models.IntegerField(default=500, verbose_name="Prix standard par UE (FCFA)")
    discounted_ue_price_fcfa = models.IntegerField(default=300, verbose_name="Prix réduit (dès 3 UE) (FCFA)")
    online_assistance_per_hour_fcfa = models.IntegerField(default=1000, verbose_name="Tutorat en ligne / heure (FCFA)")
    in_person_assistance_per_hour_fcfa = models.IntegerField(default=2000, verbose_name="Tutorat présentiel / heure (FCFA)")
    first_chapter_free_enabled = models.BooleanField(default=True, verbose_name="1ère séance toujours gratuite")
    allow_self_registration = models.BooleanField(default=True, verbose_name="Autoriser l'auto-inscription")
    university_name = models.CharField(max_length=255, default="UL Study Flow (EdTech par les étudiants)", verbose_name="Nom de l'institution")
    academic_year_current = models.CharField(max_length=50, default="2025-2026", verbose_name="Année académique courante")
    contact_phones = models.JSONField(default=list, verbose_name="Numéros de contact / T-Money / Flooz")
    contact_email = models.EmailField(default="ulstudyflow@gmail.com", verbose_name="Email de contact")

    class Meta:
        verbose_name = "Configuration de la plateforme"
        verbose_name_plural = "Configuration de la plateforme"

    def __str__(self):
        return f"Configuration UL Study Flow ({self.academic_year_current})"

    @classmethod
    def get_solo(cls) -> 'PlatformConfig':
        obj, _ = cls.objects.get_or_create(
            id=1,
            defaults={
                'default_ue_price_fcfa': 500,
                'discounted_ue_price_fcfa': 300,
                'online_assistance_per_hour_fcfa': 1000,
                'in_person_assistance_per_hour_fcfa': 2000,
                'first_chapter_free_enabled': True,
                'allow_self_registration': True,
                'university_name': "UL Study Flow (EdTech par les étudiants)",
                'academic_year_current': "2025-2026",
                'contact_phones': ['+228 99 70 59 20', '+228 71 67 69 45'],
                'contact_email': "ulstudyflow@gmail.com"
            }
        )
        return obj
