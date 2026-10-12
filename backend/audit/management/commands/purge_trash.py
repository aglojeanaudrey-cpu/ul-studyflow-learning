from django.core.management.base import BaseCommand
from audit.trash_service import purge_expired_trash


class Command(BaseCommand):
    help = "Purge les éléments de la corbeille expirés (> 30 jours)."

    def handle(self, *args, **options):
        count = purge_expired_trash()
        self.stdout.write(self.style.SUCCESS(
            f"✅ {count} élément(s) purgé(s) de la corbeille."
        ))