from django.core.management.base import BaseCommand
from referrals.utils import expire_outdated_referrals


class Command(BaseCommand):
    help = "Marque comme expirés les parrainages dont le délai d'1 mois est dépassé."

    def handle(self, *args, **options):
        count = expire_outdated_referrals()
        self.stdout.write(self.style.SUCCESS(
            f"✅ {count} parrainage(s) expiré(s)."
        ))