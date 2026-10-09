from django.core.management.base import BaseCommand
from accounts.models import User
from referrals.models import ReferralCode


class Command(BaseCommand):
    help = "Génère un code de parrainage pour tous les utilisateurs qui n'en ont pas encore."

    def handle(self, *args, **options):
        users_without_code = User.objects.filter(referral_code__isnull=True)
        total = users_without_code.count()

        if total == 0:
            self.stdout.write(self.style.SUCCESS("✅ Tous les utilisateurs ont déjà un code."))
            return

        self.stdout.write(f"Génération de {total} code(s) de parrainage...")

        created = 0
        errors = 0
        for user in users_without_code:
            try:
                ReferralCode.objects.create(user=user)
                created += 1
            except Exception as e:
                errors += 1
                self.stdout.write(self.style.WARNING(f"⚠️ Erreur pour {user.phone} : {e}"))

        self.stdout.write(self.style.SUCCESS(
            f"✅ {created} code(s) généré(s), {errors} erreur(s)."
        ))