from rest_framework.permissions import BasePermission

class IsStaffOrSuperuser(BasePermission):
    """Permet l'accès uniquement aux utilisateurs ayant le rôle STAFF ou SUPERUSER."""
    message = "Accès refusé. Privilèges insuffisants pour cette opération."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.role in ('STAFF', 'SUPERUSER') or user.is_staff or user.is_superuser))


class IsSuperuserOnly(BasePermission):
    """Permet l'accès uniquement au Super-Administrateur."""
    message = "Action réservée exclusivement au Super-Administrateur."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.role == 'SUPERUSER' or user.is_superuser))


def require_admin_permission(perm_code: str):
    """Générateur de classe de permission granulaire pour une section d'administration."""
    class SectionPermission(BasePermission):
        message = f"Accès refusé. Vous n'avez pas l'autorisation d'accéder à la section '{perm_code}'."

        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
            if user.role == 'SUPERUSER' or user.is_superuser:
                return True
            if user.role == 'STAFF' or user.is_staff:
                if hasattr(user, 'has_admin_permission'):
                    return user.has_admin_permission(perm_code)
                return True
            return False

    return SectionPermission
