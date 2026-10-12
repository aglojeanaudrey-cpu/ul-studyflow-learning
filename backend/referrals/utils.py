"""
Helpers métier pour le système de parrainage UL Study Flow.
"""

from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from notifications.models import Notification
from monetization.models import PromoCode
from django.db import models


# =============================================================================
# GESTION DES CODES DE PARRAINAGE
# =============================================================================

def get_or_create_referral_code(user):
    """Récupère ou crée le code de parrainage d'un utilisateur."""
    from .models import ReferralCode
    code, _ = ReferralCode.objects.get_or_create(user=user)
    return code


def find_referrer_by_code(code):
    """Trouve le parrain associé à un code."""
    from .models import ReferralCode
    if not code:
        return None
    try:
        referral_code = ReferralCode.objects.select_related('user').get(code=code.strip().upper())
        return referral_code.user
    except ReferralCode.DoesNotExist:
        return None


# =============================================================================
# CRÉATION DE PARRAINAGE À L'INSCRIPTION
# =============================================================================

def create_referral_from_code(referee, referral_code_str):
    """
    Crée un parrainage lorsqu'un nouveau user s'inscrit avec un code.

    Vérifications anti-triche :
    - Le parrain doit exister
    - Le filleul ne peut pas être le parrain (auto-parrainage)
    - Le filleul ne peut être parrainé qu'une seule fois
    - Le code doit correspondre à un user actif
    """
    from .models import Referral, ReferralCode

    if not referral_code_str:
        return None

    # Trouver le parrain
    referrer = find_referrer_by_code(referral_code_str)
    if not referrer:
        return None

    # Anti-triche : pas d'auto-parrainage
    if referrer.id == referee.id:
        return None

    # Anti-triche : un seul parrainage par filleul
    if Referral.objects.filter(referee=referee).exists():
        return None

    # Le parrain doit être actif
    if not referrer.is_active:
        return None

    # Créer le parrainage
    try:
        referral = Referral.objects.create(
            referrer=referrer,
            referee=referee,
            referral_code=referral_code_str.strip().upper(),
            status='pending',
        )

        # Incrémenter le compteur du code
        ReferralCode.objects.filter(user=referrer).update(
            total_referrals=models.F('total_referrals') + 1
        )

        # Notifier le parrain
        try:
            notify_referrer_new_referee(referral)
        except Exception as e:
            print(f"[referrals] Erreur notif nouveau filleul : {e}")

        return referral

    except Exception as e:
        print(f"[referrals] Erreur création referral : {e}")
        return None


# =============================================================================
# VALIDATION DU PARRAINAGE (déclenchée à l'approbation d'une UE)
# =============================================================================

def validate_referral_if_applicable(user, ue_code=None):
    """
    Vérifie si ce user est un filleul en attente et valide son parrainage.

    Déclenchée à chaque fois qu'un user débloque une UE payante.
    Si c'est son premier déblocage ET qu'il a un parrain → valider.
    """
    from .models import Referral, ReferralCode

    referral = Referral.objects.filter(referee=user, status='pending').first()
    if not referral:
        return None

    # Vérifier que le parrainage n'a pas expiré
    if timezone.now() > referral.expires_at:
        referral.mark_as_expired()
        return None

    # Valider
    referral.status = 'validated'
    referral.validated_at = timezone.now()
    referral.validation_reason = f"Déblocage de l'UE {ue_code}" if ue_code else "Déblocage UE"
    referral.save()

    # Incrémenter le compteur validé du code parrain
    ReferralCode.objects.filter(user=referral.referrer).update(
        validated_referrals=models.F('validated_referrals') + 1
    )

    # Rafraîchir le code pour avoir la nouvelle valeur
    referrer_code = ReferralCode.objects.get(user=referral.referrer)

    # Notifier le parrain
    try:
        notify_referrer_referral_validated(referral)
    except Exception as e:
        print(f"[referrals] Erreur notif validation : {e}")

    # Vérifier les paliers
    try:
        check_and_grant_milestones(referrer_code)
    except Exception as e:
        print(f"[referrals] Erreur check paliers : {e}")

    return referral


# =============================================================================
# PALIERS & RÉCOMPENSES
# =============================================================================

MILESTONES = [
    {
        'threshold': 1,
        'reward_type': 'discount_10',
        'label': 'Code -10% sur une UE',
        'promo_percent': 10,
    },
    {
        'threshold': 3,
        'reward_type': 'discount_20',
        'label': 'Code -20% sur une UE',
        'promo_percent': 20,
    },
    {
        'threshold': 5,
        'reward_type': 'free_ue',
        'label': '1 UE offerte au choix',
        'promo_percent': None,  # Traité différemment
    },
    {
        'threshold': 25,
        'reward_type': 'sponsored_1m',
        'label': '1 mois sponsorisé (accès total gratuit)',
        'promo_percent': None,
    },
]


def check_and_grant_milestones(referral_code):
    """
    Vérifie si le parrain a atteint un nouveau palier et attribue la récompense.
    Ne s'exécute qu'une seule fois par palier.
    """
    from .models import ReferralReward

    count = referral_code.validated_referrals
    user = referral_code.user

    for milestone in MILESTONES:
        threshold = milestone['threshold']
        reward_type = milestone['reward_type']

        # Le palier est atteint ?
        if count < threshold:
            continue

        # Déjà attribué ?
        if ReferralReward.objects.filter(user=user, milestone=threshold).exists():
            continue

        # Attribuer la récompense
        grant_reward(user, reward_type, threshold, milestone)


def grant_reward(user, reward_type, milestone, milestone_config):
    """Attribue une récompense spécifique."""
    from .models import ReferralReward

    promo_code_str = None
    expires_at = None

    if reward_type in ('discount_10', 'discount_20'):
        # Créer un code promo UNE UTILISATION
        promo_code_str = _generate_unique_promo_code(user, milestone_config['promo_percent'])
        expires_at = timezone.now() + timedelta(days=60)  # Valable 60 jours

    elif reward_type == 'free_ue':
        # Code promo 100% mais VALABLE SUR UNE SEULE UE
        # On utilise un discount_percent de 100 mais on limite via le front :
        # - l'utilisateur ne pourra sélectionner qu'UNE SEULE UE avec ce code
        promo_code_str = _generate_unique_promo_code(user, 100)
        expires_at = timezone.now() + timedelta(days=60)

    elif reward_type == 'sponsored_1m':
        # ATTENTION : On N'ACTIVE PAS automatiquement
        # L'utilisateur devra cliquer sur "Activer ma sponsorisation" dans son espace
        # Cela évite qu'il soit sponsorisé à un moment où il n'en a pas besoin
        pass

    # Créer l'entrée historique
    reward = ReferralReward.objects.create(
        user=user,
        reward_type=reward_type,
        milestone=milestone,
        promo_code=promo_code_str,
        expires_at=expires_at,
    )

    # Notifier le parrain
    try:
        notify_referrer_milestone_reached(user, milestone, milestone_config['label'], promo_code_str)
    except Exception as e:
        print(f"[referrals] Erreur notif palier : {e}")

    return reward


def _generate_unique_promo_code(user, discount_percent):
    """Génère un code promo unique lié au parrainage."""
    from .models import ReferralCode

    # Récupérer le code de parrainage du user pour préfixer
    try:
        ref_code = ReferralCode.objects.get(user=user)
        prefix = f"PARRAIN{ref_code.code}"[:20]
    except ReferralCode.DoesNotExist:
        prefix = f"REF{user.phone[-4:]}"

    # Ajouter un suffixe unique
    import secrets
    suffix = secrets.token_hex(2).upper()
    code_str = f"{prefix}-{suffix}"

    # Créer le code promo
    PromoCode.objects.create(
        code=code_str,
        discount_percent=discount_percent,
        applicable_to='ue_unlock',
        is_active=True,
        created_by='referral_system',
    )

    return code_str


# =============================================================================
# EXPIRATION (via cron)
# =============================================================================

def expire_outdated_referrals():
    """
    Marque comme expirés tous les parrainages en 'pending' dont la date
    d'expiration est dépassée. À appeler depuis un cron quotidien.
    """
    from .models import Referral

    now = timezone.now()
    outdated = Referral.objects.filter(status='pending', expires_at__lt=now)

    count = outdated.count()
    for ref in outdated:
        ref.mark_as_expired()

    return count


# =============================================================================
# NOTIFICATIONS
# =============================================================================

def notify_referrer_new_referee(referral):
    """Notifie le parrain qu'un nouveau filleul vient de s'inscrire."""
    referrer = referral.referrer
    referee = referral.referee

    notif = Notification.objects.create(
        title="🎉 Nouveau filleul inscrit !",
        message=(
            f"Bonjour {referrer.first_name},\n\n"
            f"{referee.first_name} {referee.last_name} vient de s'inscrire avec votre code de parrainage.\n\n"
            f"Son parrainage sera validé dès qu'il aura débloqué au moins une UE (dans un délai d'1 mois)."
        ),
        notification_type='success',
        priority='normal',
        target_type='USERS',
        status='SENT',
        action_url='student_referral',
    )
    notif.recipients.set([referrer])
    return notif


def notify_referrer_referral_validated(referral):
    """Notifie le parrain qu'un parrainage a été validé."""
    referrer = referral.referrer
    referee = referral.referee

    notif = Notification.objects.create(
        title="✅ Parrainage validé !",
        message=(
            f"Bonjour {referrer.first_name},\n\n"
            f"Excellente nouvelle ! Le parrainage de {referee.first_name} {referee.last_name} "
            f"vient d'être validé (il a débloqué sa première UE).\n\n"
            f"Consultez votre tableau de parrainage pour voir votre progression vers la prochaine récompense."
        ),
        notification_type='success',
        priority='normal',
        target_type='USERS',
        status='SENT',
        action_url='student_referral',
    )
    notif.recipients.set([referrer])
    return notif


def notify_referrer_milestone_reached(user, milestone, label, promo_code=None):
    """Notifie le parrain qu'il a atteint un nouveau palier."""
    promo_text = f"\n\n🎁 Votre code : {promo_code}" if promo_code else ""

    notif = Notification.objects.create(
        title=f"🏆 Palier atteint : {milestone} parrainage(s) !",
        message=(
            f"Bravo {user.first_name} !\n\n"
            f"Vous venez d'atteindre {milestone} parrainage(s) validé(s).\n"
            f"Récompense : {label}{promo_text}\n\n"
            f"Consultez votre page Mon Parrainage pour tous les détails."
        ),
        notification_type='success',
        priority='high',
        target_type='USERS',
        status='SENT',
        action_url='student_referral',
    )
    notif.recipients.set([user])
    return notif

# =============================================================================
# ACTIVATION MANUELLE DE LA SPONSORISATION
# =============================================================================

def activate_sponsorship(reward):
    """
    Active manuellement une récompense 'sponsored_1m'.
    - Vérifie que la récompense est bien de type 'sponsored_1m'
    - Vérifie qu'elle n'est pas déjà activée
    - Active user.is_sponsored pour 30 jours
    - Enregistre les timestamps
    """
    from .models import ReferralReward

    if reward.reward_type != 'sponsored_1m':
        return False, "Cette récompense n'est pas une sponsorisation."

    if reward.is_activated:
        return False, "Cette sponsorisation est déjà activée."

    now = timezone.now()
    expiry = now + timedelta(days=30)

    # Activer sur le user
    user = reward.user
    user.is_sponsored = True
    user.save(update_fields=['is_sponsored'])

    # Marquer la récompense comme activée
    reward.is_activated = True
    reward.activated_at = now
    reward.sponsorship_expires_at = expiry
    reward.save(update_fields=['is_activated', 'activated_at', 'sponsorship_expires_at'])

    return True, f"Sponsorisation activée jusqu'au {expiry.strftime('%d/%m/%Y')}."


def expire_sponsorships():
    """
    Cron quotidien : désactive les sponsorisations expirées.
    À appeler depuis une management command.
    """
    from .models import ReferralReward

    now = timezone.now()
    expired_rewards = ReferralReward.objects.filter(
        reward_type='sponsored_1m',
        is_activated=True,
        sponsorship_expires_at__lt=now,
    )

    count = 0
    for reward in expired_rewards:
        # Vérifier si l'user a une AUTRE sponsorisation active
        other_active = ReferralReward.objects.filter(
            user=reward.user,
            reward_type='sponsored_1m',
            is_activated=True,
            sponsorship_expires_at__gt=now,
        ).exclude(id=reward.id).exists()

        if not other_active:
            # Désactiver la sponsorisation du user
            reward.user.is_sponsored = False
            reward.user.save(update_fields=['is_sponsored'])

        # Marquer comme "utilisée" (consommée)
        reward.is_used = True
        reward.used_at = now
        reward.save(update_fields=['is_used', 'used_at'])

        count += 1

        # Notifier l'utilisateur
        try:
            from notifications.models import Notification
            notif = Notification.objects.create(
                title="⏰ Votre sponsorisation a expiré",
                message=(
                    f"Bonjour {reward.user.first_name},\n\n"
                    f"Votre mois de sponsorisation est terminé. "
                    f"Vous pouvez désormais utiliser un code promo ou en gagner un nouveau "
                    f"en parrainant d'autres étudiants !"
                ),
                notification_type='info',
                priority='normal',
                target_type='USERS',
                status='SENT',
                action_url='student_referral',
            )
            notif.recipients.set([reward.user])
        except Exception as e:
            print(f"[referrals] Erreur notif expiration sponsorisation : {e}")

    return count