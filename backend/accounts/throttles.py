from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Limite stricte sur les tentatives de connexion (par IP)."""
    scope = 'login'


class RegisterRateThrottle(AnonRateThrottle):
    """Limite stricte sur les inscriptions (anti-spam)."""
    scope = 'register'