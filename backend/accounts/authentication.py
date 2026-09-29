from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from .models import AuthToken

class ULSFTokenAuthentication(BaseAuthentication):
    """
    Authentification Bearer personnalisée pour UL STUDY FLOW.
    Compatible avec le frontend React ('Authorization: Bearer ulsf_...').
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token_key = parts[1]
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
