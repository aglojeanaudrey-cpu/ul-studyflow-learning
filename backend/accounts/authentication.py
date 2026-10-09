from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from .models import AuthToken


class ULSFTokenAuthentication(BaseAuthentication):
    """
    Authentification Bearer personnalisée pour UL STUDY FLOW.
    Priorité : header Authorization > cookie HttpOnly.
    """

    def authenticate(self, request):
        token_key = None

        # 1. Header Authorization (utile pour debug / Postman / API externe)
        auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token_key = parts[1]

        # 2. Cookie HttpOnly (mécanisme principal pour le navigateur)
        if not token_key:
            token_key = request.COOKIES.get('ulsf_session')

        # Aucun token fourni → utilisateur anonyme
        if not token_key:
            return None

        # Valider le token
        try:
            token = AuthToken.objects.select_related('user').get(key=token_key)
        except AuthToken.DoesNotExist:
            raise exceptions.AuthenticationFailed('Session expirée ou jeton invalide. Veuillez vous reconnecter.')

        if not token.is_valid():
            token.delete()
            raise exceptions.AuthenticationFailed('Session expirée. Veuillez vous reconnecter.')

        if not token.user.is_active:
            raise exceptions.AuthenticationFailed('Compte utilisateur désactivé. Veuillez contacter le support.')

        return (token.user, token)

    def authenticate_header(self, request):
        return 'Bearer realm="api"'