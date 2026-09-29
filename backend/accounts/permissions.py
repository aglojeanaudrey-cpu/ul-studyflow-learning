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
