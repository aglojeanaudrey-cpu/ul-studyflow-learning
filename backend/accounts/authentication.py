from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from .models import AuthToken


class ULSFTokenAuthentication(BaseAuthentication):
    """
    Authentification Bearer personnalisée pour UL STUDY FLOW.
    Priorité : header Authorization > cookie HttpOnly.

    RÈGLE D'OR :
    - Aucun token fourni → anonyme (retourne None)
    - Token fourni mais invalide → on ignore silencieusement (retourne None)
      pour ne PAS casser les vues publiques (AllowAny)
    - Token fourni, trouvé et valide → utilisateur authentifié
    """

    def authenticate(self, request):
        token_key = None

        # 1. Header Authorization
        auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token_key = parts[1]

        # 2. Cookie HttpOnly
        if not token_key:
            token_key = request.COOKIES.get('ulsf_session_v2')

        # Aucun token → utilisateur anonyme
        if not token_key:
            return None

        # ⭐ Token fourni mais invalide → on retourne None (anonyme)
        # Cela permet aux vues AllowAny de fonctionner malgré un vieux cookie
        try:
            token = AuthToken.objects.select_related('user').get(key=token_key)
        except AuthToken.DoesNotExist:
            # Cookie expiré ou révoqué → on ignore silencieusement
            return None

        if not token.is_valid():
            try:
                token.delete()
            except Exception:
                pass
            return None

        if not token.user.is_active:
            return None

        return (token.user, token)

    def authenticate_header(self, request):
        return 'Bearer realm="api"'