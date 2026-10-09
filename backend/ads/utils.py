from accounts.models import User
from notifications.models import Notification


def notify_superusers_about_campaign(campaign, action='created', actor=None):
    """
    Notifie tous les SUPERUSER lors de la création ou publication d'une campagne.
    
    - action='created' : campagne créée
    - action='published' : campagne activée (passage false → true)
    """
    superusers = User.objects.filter(role='SUPERUSER', is_active=True)
    if not superusers.exists():
        return

    if action == 'created':
        title = "📢 Nouvelle campagne créée"
        message = f"« {campaign.title} » ({campaign.get_popup_type_display()})"
    elif action == 'published':
        title = "📢 Nouvelle campagne publiée"
        message = f"« {campaign.title} » est maintenant active et visible."
    else:
        return

    if actor:
        message += f"\nCréée par : {actor.first_name} {actor.last_name} ({actor.phone})"

    # Créer la notification (destinataire = USERS spécifiques : tous les superusers)
    notif = Notification.objects.create(
        title=title,
        message=message,
        notification_type='info',
        priority='normal',
        target_type='USERS',
        created_by=actor,
        status='SENT',
        action_url='/admin/ads',  # Lien vers la future page admin des publicités
    )
    notif.recipients.set(superusers)
    return notif