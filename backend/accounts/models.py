import secrets
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from .utils import normalize_phone, hash_legacy_password, verify_legacy_password

class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("Le numéro de téléphone est obligatoire.")
        canonical, display, is_valid = normalize_phone(phone)
        if not is_valid:
            canonical = phone
            display = phone

        extra_fields.setdefault('display_phone', display)
        extra_fields.setdefault('role', 'USER')
        extra_fields.setdefault('is_active', True)

        user = self.model(phone=canonical, **extra_fields)
        if not user.id:
            user.id = f"usr_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('role', 'SUPERUSER')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('USER', 'Étudiant'),
        ('STAFF', 'Enseignant / Staff'),
        ('SUPERUSER', 'Super Administrateur'),
    )

    LEVEL_CHOICES = (
        ('L1', 'Licence 1'),
        ('L2', 'Licence 2'),
        ('L3', 'Licence 3'),
    )

    id = models.CharField(max_length=64, primary_key=True, default='')
    phone = models.CharField(max_length=32, unique=True, verbose_name="Téléphone (canonique)")
    display_phone = models.CharField(max_length=32, blank=True, verbose_name="Téléphone affiché")
    email = models.EmailField(max_length=255, blank=True, null=True, verbose_name="Adresse email")
    first_name = models.CharField(max_length=150, verbose_name="Prénom")
    last_name = models.CharField(max_length=150, verbose_name="Nom de famille")
    department = models.CharField(max_length=120, default='FASEG', verbose_name="Faculté / Département")
    program = models.CharField(max_length=120, default='Sciences Économiques', verbose_name="Filière")
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='L1', verbose_name="Niveau")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='USER', verbose_name="Rôle")

    is_active = models.BooleanField(default=True, verbose_name="Compte actif")
    is_staff = models.BooleanField(default=False, verbose_name="Accès administration")
    is_superuser = models.BooleanField(default=False, verbose_name="Super-administrateur")

    is_sponsored = models.BooleanField(default=False, verbose_name="Compte sponsorisé (Accès gratuit total)")
    is_ai_suspended = models.BooleanField(default=False, verbose_name="Accès IA suspendu")
    admin_permissions = models.JSONField(default=list, blank=True, verbose_name="Permissions granulaires administration")

    password_hash = models.CharField(max_length=255, blank=True, null=True, verbose_name="Hash PBKDF2 (Legacy)")
    password_salt = models.CharField(max_length=255, blank=True, null=True, verbose_name="Salt PBKDF2 (Legacy)")

    created_at = models.DateTimeField(default=timezone.now, verbose_name="Date d'inscription")
    last_login_at = models.DateTimeField(null=True, blank=True, verbose_name="Dernière connexion")

    objects = UserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.display_phone or self.phone}) [{self.role}]"

    def has_admin_permission(self, perm_code: str) -> bool:
        """Vérifie si l'utilisateur a la permission d'accéder à une section admin spécifique."""
        if self.role == 'SUPERUSER' or self.is_superuser:
            return True
        if self.role == 'STAFF' or self.is_staff:
            perms = self.admin_permissions or []
            # Si aucune permission n'a encore été restreinte spécifiquement, donner accès de base
            if not perms:
                return perm_code in ['dashboard', 'courses', 'progress']
            return perm_code in perms
        return False

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"usr_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        if self.role == 'SUPERUSER':
            self.is_superuser = True
            self.is_staff = True
        elif self.role == 'STAFF':
            self.is_staff = True
        super().save(*args, **kwargs)

    def set_password(self, raw_password):
        super().set_password(raw_password)
        # Maintenir aussi le hash PBKDF2 SHA-512 pour une compatibilité totale
        if raw_password:
            h, s = hash_legacy_password(raw_password)
            self.password_hash = h
            self.password_salt = s

    def check_password(self, raw_password):
        # 1. Vérification avec le hash legacy PBKDF2 SHA-512 si présent
        if self.password_hash and self.password_salt:
            if verify_legacy_password(raw_password, self.password_hash, self.password_salt):
                return True
        # 2. Vérification standard Django
        return super().check_password(raw_password)


class AuthToken(models.Model):
    """Token d'authentification Bearer pour les requêtes API (valable 7 jours)."""
    key = models.CharField(max_length=80, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tokens')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        verbose_name = "Jeton d'authentification"
        verbose_name_plural = "Jetons d'authentification"

    @classmethod
    def create_for_user(cls, user: User, days: int = 7) -> 'AuthToken':
        token_key = f"ulsf_{secrets.token_hex(32)}"
        expires = timezone.now() + timedelta(days=days)
        return cls.objects.create(key=token_key, user=user, expires_at=expires)

    def is_valid(self) -> bool:
        return timezone.now() < self.expires_at and self.user.is_active

    def __str__(self):
        return f"Token for {self.user.phone} (expires: {self.expires_at})"


import secrets
from django.db import models
from django.utils import timezone
from accounts.models import User


class PartnershipRequest(models.Model):
    """Demande d'un étudiant délégué souhaitant rejoindre le projet."""

    STATUS_CHOICES = (
        ('pending', 'En attente'),
        ('reviewing', 'En cours d\'examen'),
        ('accepted', 'Acceptée'),
        ('rejected', 'Refusée'),
    )

    id = models.CharField(max_length=64, primary_key=True, default='')
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='partnership_requests',
        verbose_name="Utilisateur soumetteur",
    )
    full_name = models.CharField(max_length=200, verbose_name="Nom complet")
    phone = models.CharField(max_length=30, verbose_name="Téléphone / WhatsApp")
    email = models.EmailField(blank=True, verbose_name="Email (optionnel)")
    department = models.CharField(max_length=120, verbose_name="Département / Faculté")
    program = models.CharField(max_length=120, verbose_name="Filière")
    level = models.CharField(max_length=20, verbose_name="Niveau")
    is_delegate = models.BooleanField(default=False, verbose_name="Est délégué(e) ?")
    motivation = models.TextField(verbose_name="Motivation")
    contribution = models.TextField(blank=True, verbose_name="Contribution envisagée")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_note = models.TextField(blank=True, verbose_name="Note interne")
    created_at = models.DateTimeField(default=timezone.now)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='reviewed_partnerships',
    )

    class Meta:
        verbose_name = "Demande de partenariat"
        verbose_name_plural = "Demandes de partenariat"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.department}) - {self.status}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"part_{int(timezone.now().timestamp())}_{secrets.token_hex(3)}"
        super().save(*args, **kwargs)


class ContactMessage(models.Model):
    """Message envoyé depuis le formulaire de contact public."""

    STATUS_CHOICES = (
        ('new', 'Nouveau'),
        ('read', 'Lu'),
        ('replied', 'Répondu'),
        ('archived', 'Archivé'),
    )

    id = models.CharField(max_length=64, primary_key=True, default='')
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True)
    subject = models.CharField(max_length=200, default='Général')
    message = models.TextField()

    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='contact_messages',
        verbose_name="Utilisateur (si connecté)",
    )
    ip = models.GenericIPAddressField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    admin_note = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    handled_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='handled_contacts',
    )

    class Meta:
        verbose_name = "Message de contact"
        verbose_name_plural = "Messages de contact"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.subject} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"contact_{int(timezone.now().timestamp())}_{secrets.token_hex(3)}"
        super().save(*args, **kwargs)
