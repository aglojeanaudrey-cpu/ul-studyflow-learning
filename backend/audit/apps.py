from django.apps import AppConfig


class AuditConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'audit'

    def ready(self):
        # Charger les signaux pour qu'ils soient enregistrés
        import importlib
        importlib.import_module(".signals", package=__package__)