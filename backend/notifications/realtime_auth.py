"""
Génération de JWT courts pour authentifier le client frontend
auprès de Supabase Realtime.

Ce JWT est DISTINCT de l'auth Django (ULSFTokenAuthentication).
Il sert uniquement à faire accepter le client sur les canaux privés
Realtime via RLS sur realtime.messages.
"""
import time
import jwt
from django.conf import settings


def generate_realtime_jwt(user) -> str:
    """
    Génère un JWT court (5 min) signé avec le JWT Secret Supabase.
    Le claim `sub` DOIT correspondre à l'ID du user Django, car
    c'est ce que `auth.uid()` lira côté Supabase pour matcher
    le topic `notifications:user:<user_id>`.
    """
    if not settings.SUPABASE_JWT_SECRET:
        raise RuntimeError(
            "SUPABASE_JWT_SECRET non configuré. "
            "Ajoute-le dans .env et sur Render."
        )

    now = int(time.time())
    payload = {
        "iss": settings.SUPABASE_JWT_ISSUER,
        "sub": str(user.id),          # ⭐ auth.uid() lira ce champ
        "aud": "authenticated",       # rôle Supabase attendu
        "role": "authenticated",
        "iat": now,
        "exp": now + settings.SUPABASE_JWT_TTL_SECONDS,
        # Claim custom utile pour debug / RLS avancé
        "user_role": getattr(user, "role", None),
    }

    return jwt.encode(
        payload,
        settings.SUPABASE_JWT_SECRET,
        algorithm="HS256",
    )