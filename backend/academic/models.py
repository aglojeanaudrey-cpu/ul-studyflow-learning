import secrets
from django.db import models
from django.utils import timezone

class Department(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    code = models.CharField(max_length=32, verbose_name="Sigle / Code (ex: FASEG)")
    name = models.CharField(max_length=255, verbose_name="Nom de la Faculté / Département")
    faculty = models.CharField(max_length=255, default="Université de Lomé", verbose_name="Établissement")
    description = models.TextField(blank=True, verbose_name="Description")
    is_suspended = models.BooleanField(default=False, verbose_name="Suspendu")

    class Meta:
        verbose_name = "Département / Faculté"
        verbose_name_plural = "Départements & Facultés"
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"dept_{secrets.token_hex(4)}"
        super().save(*args, **kwargs)


class Program(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs', verbose_name="Département")
    code = models.CharField(max_length=32, verbose_name="Code de la filière")
    name = models.CharField(max_length=255, verbose_name="Nom de la filière")
    description = models.TextField(blank=True, verbose_name="Description")
    is_suspended = models.BooleanField(default=False, verbose_name="Suspendu")

    class Meta:
        verbose_name = "Filière de formation"
        verbose_name_plural = "Filières de formation"
        ordering = ['department', 'name']

    def __str__(self):
        return f"{self.department.code} - {self.name} ({self.code})"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"prog_{secrets.token_hex(4)}"
        super().save(*args, **kwargs)


class AcademicYear(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    label = models.CharField(max_length=32, verbose_name="Année académique (ex: 2025-2026)")
    is_current = models.BooleanField(default=False, verbose_name="Année en cours")
    is_archived = models.BooleanField(default=False, verbose_name="Archivée")

    class Meta:
        verbose_name = "Année académique"
        verbose_name_plural = "Années académiques"
        ordering = ['-label']

    def __str__(self):
        return f"{self.label} {'(En cours)' if self.is_current else ''}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"ay_{secrets.token_hex(4)}"
        if self.is_current:
            AcademicYear.objects.exclude(id=self.id).update(is_current=False)
        super().save(*args, **kwargs)
