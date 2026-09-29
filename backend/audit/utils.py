from django.utils import timezone
from .models import AuditLog

def log_audit(action: str, resource: str, details: str, user=None, ip: str = None) -> AuditLog:
    """Enregistre une entrée dans le journal d'audit de la plateforme."""
    try:
        user_phone = ''
        user_role = ''
        user_instance = None

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
