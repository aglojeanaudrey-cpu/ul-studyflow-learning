import secrets
from django.db import models
from django.utils import timezone
from accounts.models import User

class DynamicForm(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    title = models.CharField(max_length=255, verbose_name="Titre du formulaire")
    description = models.TextField(blank=True, verbose_name="Description / Instructions")
    theme_color = models.CharField(max_length=30, default="#075E54", verbose_name="Couleur du thème")
    is_active = models.BooleanField(default=True, verbose_name="Actif / Accessible")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Date de création")
    fields = models.JSONField(default=list, verbose_name="Champs configurés (JSON)")

    class Meta:
        verbose_name = "Formulaire dynamique"
        verbose_name_plural = "Formulaires dynamiques"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({'Actif' if self.is_active else 'Inactif'})"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"form_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        super().save(*args, **kwargs)


class FormSubmission(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    form = models.ForeignKey(DynamicForm, on_delete=models.CASCADE, related_name='submissions', verbose_name="Formulaire")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='form_submissions', verbose_name="Utilisateur")
    user_name = models.CharField(max_length=150, verbose_name="Nom de l'étudiant / visiteur")
    user_phone = models.CharField(max_length=50, verbose_name="Téléphone de contact")
    data = models.JSONField(default=dict, verbose_name="Données soumises (JSON)")
    submitted_at = models.DateTimeField(default=timezone.now, verbose_name="Date de soumission")

    class Meta:
        verbose_name = "Soumission de formulaire"
        verbose_name_plural = "Soumissions de formulaires"
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user_name} ({self.user_phone}) - {self.form.title}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"sub_{int(timezone.now().timestamp())}_{secrets.token_hex(2)}"
        super().save(*args, **kwargs)
