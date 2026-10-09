"""
Utilitaires de notification pour UL Study Flow.

Ce module centralise la création de notifications pour :
- Les utilisateurs (confirmations, validations, rejets, alertes)
- Les superusers (nouvelles demandes à traiter)

Chaque fonction est autonome et peut être appelée depuis n'importe quelle vue.
"""

from django.utils import timezone
from accounts.models import User
from .models import Notification


# =============================================================================
# HELPERS GÉNÉRIQUES
# =============================================================================

def notify_user(user, title, message, notif_type='info', priority='normal', action_url=None, created_by=None):
    """
    Crée une notification individuelle pour un utilisateur donné.
    
    Args:
        user: Instance User destinataire
        title: Titre de la notification
        message: Contenu / message
        notif_type: 'info' | 'warning' | 'success' | 'alert' | 'reminder'
        priority: 'low' | 'normal' | 'high'
        action_url: Lien interne optionnel (ex: '/student_courses')
        created_by: Instance User émetteur (optionnel)
    
    Returns:
        Notification créée
    """
    if not user:
        return None

    notif = Notification.objects.create(
        title=title,
        message=message,
        notification_type=notif_type,
        priority=priority,
        target_type='USERS',
        created_by=created_by,
        status='SENT',
        action_url=action_url,
    )
    notif.recipients.set([user])
    return notif


def notify_superusers(title, message, notif_type='info', priority='normal', action_url=None, created_by=None):
    """
    Crée une notification destinée à TOUS les superusers actifs.
    """
    superusers = User.objects.filter(role='SUPERUSER', is_active=True)
    if not superusers.exists():
        return None

    notif = Notification.objects.create(
        title=title,
        message=message,
        notification_type=notif_type,
        priority=priority,
        target_type='USERS',
        created_by=created_by,
        status='SENT',
        action_url=action_url,
    )
    notif.recipients.set(superusers)
    return notif


# =============================================================================
# NOTIFICATIONS UTILISATEUR (déclenchées par des actions système ou admin)
# =============================================================================

def notify_welcome(user):
    """Notifie un nouvel inscrit de bienvenue."""
    return notify_user(
        user=user,
        title="🎓 Bienvenue sur UL Study Flow !",
        message=(
            f"Bonjour {user.first_name},\n\n"
            f"Votre compte a bien été créé. Vous avez déjà accès à vos premières UE gratuites.\n"
            f"Explorez vos cours, utilisez l'assistant IA et suivez votre progression.\n\n"
            f"Bonne rentrée sur UL Study Flow !"
        ),
        notif_type='success',
        priority='normal',
        action_url='/student_home',
    )


def notify_account_suspended(user):
    """Notifie un étudiant que son compte a été suspendu."""
    return notify_user(
        user=user,
        title="⚠️ Votre compte a été suspendu",
        message=(
            f"Bonjour {user.first_name},\n\n"
            f"Votre compte a été temporairement suspendu. "
            f"Contactez le support pour plus d'informations.\n\n"
            f"Support : +228 99 70 59 20 / +228 71 67 69 45"
        ),
        notif_type='alert',
        priority='high',
    )


def notify_account_reactivated(user):
    """Notifie un étudiant que son compte a été réactivé."""
    return notify_user(
        user=user,
        title="✅ Votre compte a été réactivé",
        message=(
            f"Bonjour {user.first_name},\n\n"
            f"Bonne nouvelle ! Votre compte a été réactivé. "
            f"Vous pouvez à nouveau accéder à vos cours et à votre progression."
        ),
        notif_type='success',
        priority='high',
        action_url='/student_home',
    )


def notify_ai_suspended(user):
    """Notifie un étudiant que son accès à l'IA a été suspendu."""
    return notify_user(
        user=user,
        title="🤖 Accès à l'assistant IA suspendu",
        message=(
            f"Bonjour {user.first_name},\n\n"
            f"L'accès à l'assistant IA a été suspendu pour votre compte. "
            f"Contactez le support si vous pensez qu'il s'agit d'une erreur."
        ),
        notif_type='warning',
        priority='normal',
    )


def notify_ai_reactivated(user):
    """Notifie un étudiant que son accès IA est rétabli."""
    return notify_user(
        user=user,
        title="🤖 Accès à l'assistant IA rétabli",
        message=(
            f"Bonjour {user.first_name},\n\n"
            f"Votre accès à l'assistant IA est de nouveau opérationnel. "
            f"Posez toutes vos questions pour progresser !"
        ),
        notif_type='success',
        priority='normal',
        action_url='/student_ai',
    )


def notify_ue_access_granted(user, ue, granted_by=None):
    """Notifie un étudiant qu'une UE lui a été accordée manuellement."""
    granted_by_text = ""
    if granted_by:
        granted_by_text = f"\n\nAccordée par : {granted_by.first_name} {granted_by.last_name}"

    return notify_user(
        user=user,
        title=f"🎉 Nouvelle UE accordée : {ue.code}",
        message=(
            f"Bonjour {user.first_name},\n\n"
            f"L'UE « {ue.title} » ({ue.code}) vient de vous être accordée.{granted_by_text}\n\n"
            f"Vous pouvez maintenant accéder à toutes les séances, chapitres et QCM de cette UE."
        ),
        notif_type='success',
        priority='normal',
        action_url=f'/student_courses',
    )


def notify_ue_access_revoked(user, ue):
    """Notifie un étudiant qu'une UE lui a été retirée."""
    return notify_user(
        user=user,
        title=f"⚠️ Accès retiré : {ue.code}",
        message=(
            f"Bonjour {user.first_name},\n\n"
            f"L'accès à l'UE « {ue.title} » ({ue.code}) a été retiré de votre compte. "
            f"Si vous pensez qu'il s'agit d'une erreur, contactez le support."
        ),
        notif_type='warning',
        priority='normal',
    )


# =============================================================================
# NOTIFICATIONS DÉBLOCAGE UE
# =============================================================================

def notify_unlock_request_submitted(unlock_request):
    """Notifie l'étudiant que sa demande de déblocage a bien été reçue."""
    ue_codes = ', '.join(unlock_request.ue_codes or [])
    return notify_user(
        user=unlock_request.user,
        title="📥 Demande de déblocage reçue",
        message=(
            f"Bonjour {unlock_request.user.first_name},\n\n"
            f"Votre demande de déblocage pour les UE : {ue_codes} a bien été enregistrée.\n\n"
            f"Référence : {unlock_request.id}\n"
            f"Montant à verser : {unlock_request.total_fcfa} FCFA\n\n"
            f"Notre équipe traitera votre demande dans les prochaines 12h."
        ),
        notif_type='info',
        priority='normal',
        action_url='/student_courses',
    )


def notify_unlock_request_approved(unlock_request):
    """Notifie l'étudiant que sa demande a été approuvée et ses UE activées."""
    ue_codes = ', '.join(unlock_request.ue_codes or [])
    return notify_user(
        user=unlock_request.user,
        title="🎉 Votre demande a été approuvée !",
        message=(
            f"Bonjour {unlock_request.user.first_name},\n\n"
            f"Excellente nouvelle ! Votre demande de déblocage a été validée.\n\n"
            f"UE activées : {ue_codes}\n"
            f"Référence : {unlock_request.id}\n\n"
            f"Vous avez maintenant accès à toutes les séances, chapitres et QCM de ces UE "
            f"pendant 6 mois et 10 jours. Bon apprentissage !"
        ),
        notif_type='success',
        priority='high',
        action_url='/student_courses',
    )


def notify_unlock_request_rejected(unlock_request, reason=None):
    """Notifie l'étudiant que sa demande a été rejetée."""
    ue_codes = ', '.join(unlock_request.ue_codes or [])
    reason_text = f"\n\nMotif : {reason}" if reason else ""

    return notify_user(
        user=unlock_request.user,
        title="❌ Demande de déblocage rejetée",
        message=(
            f"Bonjour {unlock_request.user.first_name},\n\n"
            f"Votre demande de déblocage pour les UE : {ue_codes} n'a pas pu être validée.{reason_text}\n\n"
            f"Si vous pensez qu'il s'agit d'une erreur, contactez le support au "
            f"+228 99 70 59 20 / +228 71 67 69 45."
        ),
        notif_type='warning',
        priority='high',
    )


def notify_admins_new_unlock_request(unlock_request):
    """Notifie tous les superusers qu'une nouvelle demande est à traiter."""
    user_name = f"{unlock_request.user.first_name} {unlock_request.user.last_name}"
    ue_codes = ', '.join(unlock_request.ue_codes or [])

    return notify_superusers(
        title="🔔 Nouvelle demande de déblocage",
        message=(
            f"Étudiant : {user_name} ({unlock_request.user_phone})\n"
            f"UE demandées : {ue_codes}\n"
            f"Montant : {unlock_request.total_fcfa} FCFA\n"
            f"Paiement : {unlock_request.payment_method}\n\n"
            f"À traiter sous 12h."
        ),
        notif_type='info',
        priority='high',
        action_url='/admin',
    )


# =============================================================================
# NOTIFICATIONS FORMULAIRES
# =============================================================================

def notify_form_submission_received(form, user=None, guest_name=None):
    """Notifie l'utilisateur (ou visiteur) que son formulaire a été reçu."""
    # Si c'est un utilisateur connecté, on peut lui envoyer une notification interne
    if not user:
        return None

    return notify_user(
        user=user,
        title=f"✅ Réponse reçue : {form.title}",
        message=(
            f"Bonjour {user.first_name},\n\n"
            f"Nous avons bien reçu votre réponse au formulaire « {form.title} ».\n\n"
            f"Merci de votre participation ! L'équipe UL Study Flow vous recontactera si nécessaire."
        ),
        notif_type='success',
        priority='low',
    )


# =============================================================================
# NOTIFICATIONS PÉDAGOGIQUES
# =============================================================================

def notify_quiz_passed(user, quiz_title, score_percent, ue_code=None):
    """Notifie l'étudiant qu'il a réussi un quiz."""
    ue_text = f" ({ue_code})" if ue_code else ""
    return notify_user(
        user=user,
        title="🎯 Quiz réussi !",
        message=(
            f"Bravo {user.first_name} !\n\n"
            f"Vous avez réussi le quiz « {quiz_title} »{ue_text} "
            f"avec un score de {score_percent}%.\n\n"
            f"Continuez comme ça ! 💪"
        ),
        notif_type='success',
        priority='low',
    )


def notify_ue_completed(user, ue_title, ue_code):
    """Notifie l'étudiant qu'il a terminé toutes les séances d'une UE."""
    return notify_user(
        user=user,
        title=f"🏆 UE terminée : {ue_code}",
        message=(
            f"Félicitations {user.first_name} !\n\n"
            f"Vous avez terminé toutes les séances de l'UE « {ue_title} » ({ue_code}).\n\n"
            f"Prenez le temps de réviser avec les flashcards et de refaire les QCM pour "
            f"consolider vos acquis. Bonne continuation !"
        ),
        notif_type='success',
        priority='normal',
        action_url='/student_courses',
    )

# =============================================================================
# NOTIFICATIONS DE PARRAINAGE (compatibilité — déjà dans referrals/utils.py)
# =============================================================================

# Note : les notifications de parrainage sont gérées dans referrals/utils.py.
# Aucun import croisé nécessaire ici pour éviter les boucles.