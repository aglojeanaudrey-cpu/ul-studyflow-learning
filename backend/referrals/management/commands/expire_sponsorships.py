from django.core.management.base import BaseCommand
from referrals.utils import expire_sponsorships


class Command(BaseCommand):
    help = "Désactive les sponsorisations expirées (> 30 jours après activation)."

    def handle(self, *args, **options):
        count = expire_sponsorships()
        self.stdout.write(self.style.SUCCESS(
            f"✅ {count} sponsorisation(s) expirée(s) et désactivée(s)."
        ))