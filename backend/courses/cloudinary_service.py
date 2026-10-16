"""
Service Cloudinary pour UL Study Flow.

Gère l'upload de médias pédagogiques et la génération d'URLs
signées avec watermark dynamique par étudiant.
"""
import cloudinary
import cloudinary.uploader
import cloudinary.utils
import time
from django.conf import settings


# ═══════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════

# Durée de validité d'une URL signée (2h)
SIGNED_URL_TTL = 7200

# Type de delivery : "authenticated" = non public, nécessite signature
PROTECTED_DELIVERY_TYPE = 'authenticated'


def is_cloudinary_configured():
    return bool(
        getattr(settings, 'CLOUDINARY_CLOUD_NAME', '') and
        getattr(settings, 'CLOUDINARY_API_KEY', '') and
        getattr(settings, 'CLOUDINARY_API_SECRET', '')
    )


def get_cloudinary_cloud_name():
    return getattr(settings, 'CLOUDINARY_CLOUD_NAME', '')


# ═══════════════════════════════════════════════════════════════
# UPLOAD SIGNÉ (le front envoie directement à Cloudinary)
# ═══════════════════════════════════════════════════════════════

def generate_upload_signature(resource_type='video', folder='ulstudyflow'):
    """
    Signature pour upload direct depuis le frontend.
    ⭐ Ajoute type='authenticated' → l'URL ne sera pas publique.
    """
    if not is_cloudinary_configured():
        raise ValueError("Cloudinary non configuré.")

    timestamp = int(time.time())

    # ⭐ Paramètres à signer (ordre alphabétique strict)
    params_to_sign = {
        'folder': folder,
        'timestamp': timestamp,
        'type': PROTECTED_DELIVERY_TYPE,   # ⭐ authenticated
    }

    signature = cloudinary.utils.api_sign_request(
        params_to_sign,
        settings.CLOUDINARY_API_SECRET
    )

    return {
        'signature': signature,
        'timestamp': timestamp,
        'api_key': settings.CLOUDINARY_API_KEY,
        'cloud_name': settings.CLOUDINARY_CLOUD_NAME,
        'folder': folder,
        'type': PROTECTED_DELIVERY_TYPE,   # ⭐ à renvoyer au front
    }


# ═══════════════════════════════════════════════════════════════
# UPLOAD CÔTÉ SERVEUR
# ═══════════════════════════════════════════════════════════════

def upload_media(file_obj, resource_type='video', folder='ulstudyflow/chapters', tags=None):
    """
    Upload un média depuis le backend.
    ⭐ type='authenticated' → pas de téléchargement direct possible.
    """
    if not is_cloudinary_configured():
        raise ValueError("Cloudinary non configuré.")

    try:
        upload_options = {
            'resource_type': resource_type,
            'folder': folder,
            'type': PROTECTED_DELIVERY_TYPE,   # ⭐ authenticated
            'use_filename': True,
            'unique_filename': True,
            'overwrite': False,
        }
        if tags:
            upload_options['tags'] = tags

        if resource_type == 'video':
            upload_options['eager'] = [
                {'streaming_profile': 'hd', 'format': 'm3u8'},
            ]
            upload_options['eager_async'] = True

        result = cloudinary.uploader.upload(file_obj, **upload_options)

        return {
            'success': True,
            'url': result.get('secure_url'),
            'public_id': result.get('public_id'),
            'format': result.get('format'),
            'resource_type': result.get('resource_type'),
            'duration': result.get('duration'),
            'bytes': result.get('bytes'),
            'width': result.get('width'),
            'height': result.get('height'),
            'thumbnail_url': _get_thumbnail_url(result, resource_type),
            'type': PROTECTED_DELIVERY_TYPE,
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}


def _get_thumbnail_url(result, resource_type):
    """Miniature vidéo via un asset séparé."""
    if resource_type != 'video':
        return None
    public_id = result.get('public_id')
    if not public_id:
        return None
    # ⭐ La miniature reste publique (type 'upload') car pas de données sensibles
    return cloudinary.CloudinaryImage(public_id).build_url(
        resource_type='video',
        type='upload',           # miniature publique OK
        format='jpg',
        transformation=[
            {'width': 640, 'height': 360, 'crop': 'fill'},
            {'start_offset': '2'},
        ]
    )


def delete_media(public_id, resource_type='video'):
    if not is_cloudinary_configured():
        return {'success': False, 'error': 'Cloudinary non configuré'}
    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type,
            type=PROTECTED_DELIVERY_TYPE,   # ⭐ important
            invalidate=True,
        )
        return {'success': result.get('result') == 'ok', 'result': result}
    except Exception as e:
        return {'success': False, 'error': str(e)}


# ═══════════════════════════════════════════════════════════════
# SÉCURITÉ : URL SIGNÉE + WATERMARK GRAVÉ
# ═══════════════════════════════════════════════════════════════

def _build_watermark_text(user):
    """Construit le texte du watermark à partir du user."""
    # Nom complet + première lettre du prénom si dispo
    full_name = f"{user.first_name} {user.last_name}".strip()
    if not full_name:
        full_name = user.phone or "Étudiant"

    phone = getattr(user, 'display_phone', None) or user.phone or ''
    today = time.strftime('%d/%m/%Y')

    parts = [full_name]
    if phone:
        parts.append(phone)
    parts.append(today)
    return " · ".join(parts)


def build_secure_video_url(public_id, user, expires_in=SIGNED_URL_TTL):
    """
    Génère une URL signée avec watermark GRAVÉ dans la vidéo.
    
    Points clés :
    - type='authenticated' → seul le backend peut demander ce fichier
    - sign_url=True → URL invalide si modifiée
    - flags='layer_apply' → Cloudinary GRAVE le watermark dans le rendu
    - expires_at → URL qui expire
    """
    if not is_cloudinary_configured() or not public_id:
        return None

    watermark_text = _build_watermark_text(user)

    # ⭐ Transformation avec watermark gravé
    transformation = [
        # 1. Watermark principal (bas-droite, semi-transparent)
        {
            'overlay': {
                'font_family': 'Arial',
                'font_size': 28,
                'text': watermark_text,
            },
            'color': '#FFFFFF',
            'opacity': 25,              # ⭐ 25% opacity
            'gravity': 'south_east',
            'x': 24,
            'y': 80,                    # ⭐ au-dessus des contrôles natifs
        },
        # 2. Watermark secondaire (haut-gauche, discret)
        {
            'overlay': {
                'font_family': 'Arial',
                'font_size': 18,
                'text': 'UL Study Flow',
            },
            'color': '#FFFFFF',
            'opacity': 15,
            'gravity': 'north_west',
            'x': 24,
            'y': 24,
        },
        # 3. ⭐ Flags OBLIGATOIRES pour graver
        {'flags': 'layer_apply'},
        # 4. Format de sortie streaming (HLS)
        # Note : on ne force pas m3u8 pour éviter les problèmes de player HTML5
        # sauf si tu utilises hls.js côté front
    ]

    # Timestamp d'expiration (en secondes Unix)
    expires_at = int(time.time()) + expires_in

    url, options = cloudinary.utils.cloudinary_url(
        public_id,
        resource_type='video',
        type=PROTECTED_DELIVERY_TYPE,        # ⭐ authenticated
        sign_url=True,                       # ⭐ URL signée
        secure=True,
        transformation=transformation,
        expires_at=expires_at,               # ⭐ expiration
        # ⭐ Format mp4 universel (HLS = plus complexe côté player)
        format='mp4',
    )
    return url


def build_watermarked_audio_url(public_id, user, expires_in=SIGNED_URL_TTL):
    """Version audio : URL signée + expiration, pas de watermark visuel."""
    if not is_cloudinary_configured() or not public_id:
        return None

    expires_at = int(time.time()) + expires_in

    url, _ = cloudinary.utils.cloudinary_url(
        public_id,
        resource_type='video',               # audio = resource_type video chez Cloudinary
        type=PROTECTED_DELIVERY_TYPE,
        sign_url=True,
        secure=True,
        expires_at=expires_at,
    )
    return url


def build_watermarked_pdf_url(public_id, user, expires_in=SIGNED_URL_TTL):
    """Version PDF : URL signée + expiration."""
    if not is_cloudinary_configured() or not public_id:
        return None

    expires_at = int(time.time()) + expires_in

    url, _ = cloudinary.utils.cloudinary_url(
        public_id,
        resource_type='raw',                 # PDF = raw chez Cloudinary
        type=PROTECTED_DELIVERY_TYPE,
        sign_url=True,
        secure=True,
        expires_at=expires_at,
    )
    return url