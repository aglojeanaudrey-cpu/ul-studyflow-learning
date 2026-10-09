import secrets
from django.db import models
from django.utils import timezone
from accounts.models import User


def generate_popup_id():
    return f"pop_{int(timezone.now().timestamp())}_{secrets.token_hex(3)}"


def generate_template_id():
    return f"tpl_{int(timezone.now().timestamp())}_{secrets.token_hex(3)}"


class PopupTemplate(models.Model):
    """Template pré-configuré pour créer rapidement une campagne."""
    
    id = models.CharField(max_length=64, primary_key=True, default=generate_template_id)
    name = models.CharField(max_length=150, verbose_name="Nom du template")
    description = models.CharField(max_length=255, blank=True, verbose_name="Description courte")
    icon = models.CharField(max_length=50, default='FileText', verbose_name="Icône lucide-react")
    
    # Configuration pré-remplie (JSON : tous les champs d'un popup sauf id/dates/stats)
    preset = models.JSONField(default=dict, verbose_name="Configuration pré-remplie")
    
    # Méta
    is_system = models.BooleanField(default=False, verbose_name="Template système (ne peut être supprimé que par superuser)")
    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = "Template de popup"
        verbose_name_plural = "Templates de popups"
        ordering = ['name']

    def __str__(self):
        return f"{self.name}"


class PopupCampaign(models.Model):
    """Campagne publicitaire / annonce / popup configurable."""

    # === TYPES ===
    POPUP_TYPES = (
        ('info', 'Information'),
        ('promo', 'Promotion'),
        ('ad', 'Publicité'),
        ('survey', 'Enquête'),
        ('alert', 'Alerte'),
        ('announcement', 'Annonce'),
    )

    MEDIA_TYPES = (
        ('none', 'Aucun média'),
        ('image', 'Image'),
        ('video', 'Vidéo (lecture manuelle)'),
        ('video_autoplay', 'Vidéo (lecture automatique, muette)'),
    )

    BUTTON_ACTIONS = (
        ('link', 'Ouvrir un lien'),
        ('close', 'Fermer le popup'),
        ('scroll', 'Défiler vers un élément'),
    )

    SIZES = (
        ('sm', 'Petit (400px)'),
        ('md', 'Moyen (600px)'),
        ('lg', 'Grand (800px)'),
        ('xl', 'Très grand (1000px)'),
    )

    POSITIONS = (
        ('center', 'Centré'),
        ('top', 'Bandeau haut'),
        ('bottom', 'Bandeau bas'),
        ('bottom_right', 'Coin bas-droit'),
        ('bottom_left', 'Coin bas-gauche'),
    )

    ANIMATIONS = (
        ('fade', 'Fondu'),
        ('slide_up', 'Glisser vers le haut'),
        ('slide_down', 'Glisser vers le bas'),
        ('zoom', 'Zoom'),
        ('none', 'Aucune'),
    )

    TARGET_AUDIENCES = (
        ('all', 'Tout le monde'),
        ('anonymous', 'Visiteurs non connectés'),
        ('logged_in', 'Utilisateurs connectés'),
        ('students', 'Étudiants uniquement'),
        ('sponsored', 'Sponsorisés uniquement'),
    )

    TRIGGER_TYPES = (
        ('on_load', 'À l\'arrivée sur la page'),
        ('after_delay', 'Après un délai'),
        ('on_scroll', 'Après un scroll'),
        ('on_exit_intent', 'À l\'intention de sortie'),
    )

    FREQUENCIES = (
        ('once', 'Une seule fois par navigateur'),
        ('session', 'Une fois par session'),
        ('per_day', 'Une fois par jour'),
        ('always', 'À chaque visite'),
        ('custom', 'Répéter après X heures'),
    )

    # === ID & CONTENU ===
    id = models.CharField(max_length=64, primary_key=True, default=generate_popup_id)
    title = models.CharField(max_length=255, verbose_name="Titre")
    message = models.TextField(blank=True, verbose_name="Message / Contenu")
    popup_type = models.CharField(max_length=20, choices=POPUP_TYPES, default='info', verbose_name="Type de popup")

    # === TEMPLATE SOURCE (traçabilité) ===
    template_used = models.CharField(max_length=100, blank=True, verbose_name="Template d'origine")

    # === MÉDIA ===
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPES, default='none', verbose_name="Type de média")
    media_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL du média")
    media_thumbnail = models.URLField(max_length=500, blank=True, null=True, verbose_name="Miniature (poster vidéo)")

    # === BOUTONS ===
    primary_button_text = models.CharField(max_length=100, blank=True, verbose_name="Texte bouton principal")
    primary_button_action = models.CharField(max_length=20, choices=BUTTON_ACTIONS, default='link', verbose_name="Action bouton principal")
    primary_button_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL bouton principal")

    secondary_button_text = models.CharField(max_length=100, blank=True, verbose_name="Texte bouton secondaire")
    secondary_button_action = models.CharField(max_length=20, choices=BUTTON_ACTIONS, default='close', verbose_name="Action bouton secondaire")
    secondary_button_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL bouton secondaire")

    # === STYLE ===
    size = models.CharField(max_length=10, choices=SIZES, default='md', verbose_name="Taille")
    position = models.CharField(max_length=20, choices=POSITIONS, default='center', verbose_name="Position")
    accent_color = models.CharField(max_length=30, default='#25D366', verbose_name="Couleur d'accent")
    animation = models.CharField(max_length=20, choices=ANIMATIONS, default='fade', verbose_name="Animation")
    is_dismissible = models.BooleanField(default=True, verbose_name="Peut être fermé par l'utilisateur")

    # === CIBLAGE PAGES ===
    target_pages = models.JSONField(
        default=list,
        verbose_name="Pages cibles",
        help_text="Ex: ['home', 'pricing', 'features', 'admin_dashboard']"
    )

    # === CIBLAGE USERS ===
    target_audience = models.CharField(max_length=20, choices=TARGET_AUDIENCES, default='all', verbose_name="Public cible")
    target_departments = models.JSONField(default=list, blank=True, verbose_name="Départements cibles")
    target_programs = models.JSONField(default=list, blank=True, verbose_name="Filières cibles")
    target_levels = models.JSONField(default=list, blank=True, verbose_name="Niveaux cibles (L1, L2, L3)")

    # === DÉCLENCHEUR ===
    trigger_type = models.CharField(max_length=20, choices=TRIGGER_TYPES, default='after_delay', verbose_name="Déclencheur")
    trigger_delay_seconds = models.IntegerField(default=3, verbose_name="Délai (secondes)")
    trigger_scroll_percent = models.IntegerField(default=50, verbose_name="Scroll (%)")

    # === FRÉQUENCE ===
    frequency = models.CharField(max_length=20, choices=FREQUENCIES, default='once', verbose_name="Fréquence d'affichage")
    frequency_custom_hours = models.IntegerField(default=24, verbose_name="Répétition (heures)")

    # === ⭐ PROGRAMMATION AVANCÉE ===
    # Jours de la semaine : 0=Lundi, 1=Mardi, ..., 6=Dimanche (vide = tous les jours)
    schedule_days = models.JSONField(default=list, blank=True, verbose_name="Jours de la semaine (0=Lun, 6=Dim)")
    # Plage horaire (format "HH:MM", vide = toute la journée)
    schedule_hours_start = models.CharField(max_length=5, blank=True, default='', verbose_name="Heure de début (HH:MM)")
    schedule_hours_end = models.CharField(max_length=5, blank=True, default='', verbose_name="Heure de fin (HH:MM)")
    # Jours spécifiques (format "MM-DD" ou "YYYY-MM-DD", pour événements ponctuels)
    schedule_specific_dates = models.JSONField(default=list, blank=True, verbose_name="Dates spécifiques (YYYY-MM-DD)")
    # Fuseau horaire
    schedule_timezone = models.CharField(max_length=50, default='Africa/Lome', verbose_name="Fuseau horaire")

    # === STATUT ===
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    priority = models.IntegerField(default=0, verbose_name="Priorité (plus élevé = affiché en premier)")
    starts_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de début")
    ends_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de fin")

    # === STATS DÉNORMALISÉES ===
    views_count = models.IntegerField(default=0, verbose_name="Nombre de vues")
    clicks_count = models.IntegerField(default=0, verbose_name="Nombre de clics")

    # === META ===
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Date de création")
    created_by = models.CharField(max_length=100, blank=True, verbose_name="Créé par")

    class Meta:
        verbose_name = "Campagne publicitaire"
        verbose_name_plural = "Campagnes publicitaires"
        ordering = ['-priority', '-created_at']
        indexes = [
            models.Index(fields=['is_active', '-priority']),
            models.Index(fields=['starts_at', 'ends_at']),
        ]

    def __str__(self):
        return f"[{self.popup_type.upper()}] {self.title} ({'Actif' if self.is_active else 'Inactif'})"

    @property
    def is_currently_valid(self):
        """Vérifie si la campagne est active et dans sa fenêtre temporelle."""
        if not self.is_active:
            return False
        now = timezone.now()
        if self.starts_at and now < self.starts_at:
            return False
        if self.ends_at and now > self.ends_at:
            return False
        return True

    def is_in_schedule(self, now=None):
        """
        Vérifie si la campagne est dans sa fenêtre de programmation avancée
        (jours de la semaine + plage horaire + dates spécifiques).
        """
        now = now or timezone.now()

        # 1. Dates spécifiques (priorité haute si défini)
        specific_dates = self.schedule_specific_dates or []
        if specific_dates:
            today_iso = now.strftime('%Y-%m-%d')
            today_md = now.strftime('%m-%d')
            # Accepte "2025-12-25" ou "12-25"
            if not any(d == today_iso or d == today_md for d in specific_dates):
                return False

        # 2. Jours de la semaine (0=Lundi)
        days = self.schedule_days or []
        if days:
            # Python: weekday() renvoie 0=lundi, 6=dimanche
            if now.weekday() not in days:
                return False

        # 3. Plage horaire
        start = (self.schedule_hours_start or '').strip()
        end = (self.schedule_hours_end or '').strip()
        if start and end:
            try:
                current_minutes = now.hour * 60 + now.minute
                sh, sm = map(int, start.split(':'))
                eh, em = map(int, end.split(':'))
                start_minutes = sh * 60 + sm
                end_minutes = eh * 60 + em

                # Cas normal : 08:00 → 22:00
                if start_minutes <= end_minutes:
                    if not (start_minutes <= current_minutes <= end_minutes):
                        return False
                # Cas nuit : 22:00 → 06:00
                else:
                    if not (current_minutes >= start_minutes or current_minutes <= end_minutes):
                        return False
            except (ValueError, AttributeError):
                pass  # Si format invalide, on ignore

        return True

    @property
    def click_through_rate(self):
        """Taux de clic (CTR) en pourcentage."""
        if self.views_count == 0:
            return 0.0
        return round((self.clicks_count / self.views_count) * 100, 2)


class PopupView(models.Model):
    """Log de chaque affichage d'un popup (pour tracking détaillé)."""

    id = models.CharField(max_length=64, primary_key=True)
    campaign = models.ForeignKey(PopupCampaign, on_delete=models.CASCADE, related_name='view_logs', verbose_name="Campagne")

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='popup_views', verbose_name="Utilisateur")
    user_phone = models.CharField(max_length=50, blank=True, verbose_name="Téléphone")
    user_role = models.CharField(max_length=30, blank=True, verbose_name="Rôle")
    user_department = models.CharField(max_length=120, blank=True, verbose_name="Département")
    user_program = models.CharField(max_length=120, blank=True, verbose_name="Filière")
    user_level = models.CharField(max_length=10, blank=True, verbose_name="Niveau")

    page = models.CharField(max_length=100, blank=True, verbose_name="Page d'affichage")
    ip = models.CharField(max_length=50, blank=True, verbose_name="Adresse IP")
    user_agent = models.CharField(max_length=255, blank=True, verbose_name="User-Agent")

    viewed_at = models.DateTimeField(default=timezone.now, verbose_name="Date de vue", db_index=True)

    class Meta:
        verbose_name = "Vue de popup"
        verbose_name_plural = "Vues de popup"
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['campaign', '-viewed_at']),
            models.Index(fields=['user', '-viewed_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"pv_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Vue de {self.campaign.title} par {self.user_phone or 'Anonyme'} le {self.viewed_at:%d/%m/%Y %H:%M}"


class PopupClick(models.Model):
    """Log de chaque clic sur un bouton d'un popup."""

    BUTTON_TYPES = (
        ('primary', 'Bouton principal'),
        ('secondary', 'Bouton secondaire'),
        ('dismiss', 'Fermeture'),
    )

    id = models.CharField(max_length=64, primary_key=True)
    campaign = models.ForeignKey(PopupCampaign, on_delete=models.CASCADE, related_name='click_logs', verbose_name="Campagne")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='popup_clicks', verbose_name="Utilisateur")
    user_phone = models.CharField(max_length=50, blank=True, verbose_name="Téléphone")
    button_type = models.CharField(max_length=20, choices=BUTTON_TYPES, default='primary', verbose_name="Type de bouton")
    page = models.CharField(max_length=100, blank=True, verbose_name="Page")
    ip = models.CharField(max_length=50, blank=True, verbose_name="Adresse IP")
    clicked_at = models.DateTimeField(default=timezone.now, verbose_name="Date de clic", db_index=True)

    class Meta:
        verbose_name = "Clic sur popup"
        verbose_name_plural = "Clics sur popup"
        ordering = ['-clicked_at']
        indexes = [
            models.Index(fields=['campaign', '-clicked_at']),
            models.Index(fields=['user', '-clicked_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"pc_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Clic {self.button_type} sur {self.campaign.title} par {self.user_phone or 'Anonyme'}"