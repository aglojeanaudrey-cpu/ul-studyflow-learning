from django.utils import timezone
from .models import AuditLog
from notifications.models import Notification
from accounts.models import User


def log_audit(
    action: str,
    resource: str,
    details: str,
    user=None,
    ip: str = None,
    request=None,           # ⭐ NOUVEAU
) -> AuditLog:
    """
    Enregistre une entrée dans le journal d'audit.
    
    Peut être appelé de 2 façons :
      - log_audit(action, resource, details, user=..., ip=...)
      - log_audit(action, resource, details, user=..., request=request)
    
    Si `request` est fourni, on en extrait automatiquement :
      - l'utilisateur connecté (request.user)
      - l'IP (request.META['REMOTE_ADDR'])
    """
    try:
        user_phone = ''
        user_role = ''
        user_instance = None

        # ⭐ Si request fourni, on l'utilise en priorité
        if request is not None:
            # Extraction de l'IP si non fournie explicitement
            if not ip:
                ip = request.META.get('REMOTE_ADDR', '')
            # Extraction de l'utilisateur si non fourni explicitement
            if user is None:
                req_user = getattr(request, 'user', None)
                if req_user and getattr(req_user, 'is_authenticated', False):
                    user = req_user

        if user:
            if hasattr(user, 'phone'):
                user_phone = user.display_phone or user.phone
                user_role = getattr(user, 'role', 'USER')
                user_instance = user
            elif isinstance(user, dict):
                user_phone = user.get('phone', '')
                user_role = user.get('role', '')

        return AuditLog.objects.create(
            user=user_instance,
            user_phone=user_phone,
            user_role=user_role,
            action=action,
            resource=resource,
            details=details,
            ip=ip or '',
            timestamp=timezone.now()
        )
    except Exception as e:
        print(f"Error in log_audit: {e}")
        return None


def notify_admins(
    title: str,
    message: str,
    action_url: str = "",
    priority: str = "normal",
    notification_type: str = "info",
):
    """
    Crée une notification ciblée pour tous les STAFF et SUPERUSER.
    Le trigger PostgreSQL diffusera ensuite via Realtime.
    """
    admins = User.objects.filter(role__in=['STAFF', 'SUPERUSER'], is_active=True)
    if not admins.exists():
        return None

    notif = Notification.objects.create(
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority,
        target_type='USERS',
        action_url=action_url,
        status='SENT',
    )
    notif.recipients.set(admins)
    # Force un UPDATE pour déclencher on_notification_sent → broadcast avec les recipients à jour
    notif.status = 'SENT'
    notif.save(update_fields=['status'])
    return notif