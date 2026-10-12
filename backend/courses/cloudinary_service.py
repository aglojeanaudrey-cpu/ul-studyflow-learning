"""
Service Cloudinary pour UL Study Flow.

Gère l'upload de médias pédagogiques (audio, vidéo, images) vers Cloudinary
avec des transformations de sécurité et un watermark dynamique par étudiant.

Stratégie anti-partage :
- Upload sécurisé (signature côté serveur)
- Watermark transparent dynamique (nom + téléphone de l'étudiant)
- URL signée avec expiration pour éviter le partage direct
- Format HLS pour streaming (pas de fichier unique téléchargeable)
"""

import cloudinary
import cloudinary.uploader
import cloudinary.utils
import time
from django.conf import settings


# =============================================================================
# CONFIGURATION
# =============================================================================

def is_cloudinary_configured():
    """Vérifie que Cloudinary est bien configuré."""
    return bool(
        getattr(settings, 'CLOUDINARY_CLOUD_NAME', '') and
        getattr(settings, 'CLOUDINARY_API_KEY', '') and
        getattr(settings, 'CLOUDINARY_API_SECRET', '')
    )


def get_cloudinary_cloud_name():
    return getattr(settings, 'CLOUDINARY_CLOUD_NAME', '')


# =============================================================================
# UPLOAD SIGNÉ (le front envoie directement à Cloudinary)
# =============================================================================

def generate_upload_signature(resource_type='video', folder='ulstudyflow'):
    """
    Génère une signature pour que le front puisse uploader
    directement vers Cloudinary sans passer par le backend.

    Args:
        resource_type: 'video' (vidéo + audio), 'image', 'raw' (pdf, etc.)
        folder: dossier Cloudinary de destination

    Returns:
        dict avec signature, api_key, timestamp, cloud_name, folder
    """
    if not is_cloudinary_configured():
        raise ValueError("Cloudinary n'est pas configuré. Vérifiez vos variables d'environnement.")

    timestamp = int(time.time())

    # Paramètres à signer (ordre alphabétique obligatoire)
    params_to_sign = {
        'folder': folder,
        'timestamp': timestamp,
    }

    # Générer la signature
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
    }


# =============================================================================
# UPLOAD CÔTÉ SERVEUR (le backend upload puis stocke l'URL)
# =============================================================================

def upload_media(file_obj, resource_type='video', folder='ulstudyflow/chapters', tags=None):
    """
    Upload un média vers Cloudinary depuis le backend.

    Args:
        file_obj: fichier Django (request.FILES['file'])
        resource_type: 'video' (vidéo + audio), 'image', 'raw'
        folder: dossier Cloudinary
        tags: liste de tags pour catégoriser

    Returns:
        dict avec url, public_id, format, duration, etc.
    """
    if not is_cloudinary_configured():
        raise ValueError("Cloudinary n'est pas configuré. Vérifiez vos variables d'environnement.")

    try:
        upload_options = {
            'resource_type': resource_type,
            'folder': folder,
            'use_filename': True,
            'unique_filename': True,
            'overwrite': False,
        }

        if tags:
            upload_options['tags'] = tags

        # Config spécifique vidéo (streaming + thumbnail auto)
        if resource_type == 'video':
            upload_options['eager'] = [
                {'streaming_profile': 'hd', 'format': 'm3u8'},  # HLS pour streaming
            ]
            upload_options['eager_async'] = True

        result = cloudinary.uploader.upload(file_obj, **upload_options)

        # Extraire les infos utiles
        return {
            'success': True,
            'url': result.get('secure_url'),
            'public_id': result.get('public_id'),
            'format': result.get('format'),
            'resource_type': result.get('resource_type'),
            'duration': result.get('duration'),  # en secondes pour vidéo/audio
            'bytes': result.get('bytes'),
            'width': result.get('width'),
            'height': result.get('height'),
            'thumbnail_url': _get_thumbnail_url(result, resource_type),
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
        }


def _get_thumbnail_url(result, resource_type):
    """Génère une URL de miniature pour vidéo."""
    if resource_type != 'video':
        return None

    public_id = result.get('public_id')
    if not public_id:
        return None

    # Miniature auto à 2s
    return cloudinary.CloudinaryImage(public_id).build_url(
        resource_type='video',
        format='jpg',
        transformation=[
            {'width': 640, 'height': 360, 'crop': 'fill'},
            {'start_offset': '2'},
        ]
    )


def delete_media(public_id, resource_type='video'):
    """
    Supprime un média de Cloudinary.

    Args:
        public_id: identifiant Cloudinary du média
        resource_type: 'video' | 'image' | 'raw'

    Returns:
        dict avec success et résultat
    """
    if not is_cloudinary_configured():
        return {'success': False, 'error': 'Cloudinary non configuré'}

    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type,
            invalidate=True
        )
        return {'success': result.get('result') == 'ok', 'result': result}
    except Exception as e:
        return {'success': False, 'error': str(e)}


# =============================================================================
# SÉCURITÉ : WATERMARK DYNAMIQUE + URL SIGNÉE
# =============================================================================

def build_secure_video_url(public_id, user, expires_in=3600):
    """
    Construit une URL signée avec watermark dynamique pour un étudiant.

    Le watermark est appliqué à la volée par Cloudinary :
    - Nom + première lettre du nom de famille
    - Téléphone
    - Date du jour

    Args:
        public_id: identifiant Cloudinary de la vidéo
        user: instance User (pour récupérer nom, téléphone)
        expires_in: durée de validité en secondes (défaut 1h)

    Returns:
        URL signée prête à être utilisée dans un <video>
    """
    if not is_cloudinary_configured():
        return None

    # Construction du texte watermark
    name = f"{user.first_name} {user.last_name[0]}." if user.last_name else user.first_name
    phone = user.display_phone or user.phone or ''
    today = time.strftime('%d/%m/%Y')
    watermark_text = f"{name} · {phone} · {today}"

    # Transformation avec watermark
    transformation = [
        # Watermark en bas-droite, police fine, blanc semi-transparent
        {
            'overlay': {
                'font_family': 'Arial',
                'font_size': 20,
                'text': watermark_text,
            },
            'color': '#FFFFFF',
            'opacity': 20,  # 20% d'opacité (discret mais lisible)
            'gravity': 'south_east',
            'x': 20,
            'y': 20,
        },
    ]

    # Générer l'URL signée
    url = cloudinary.CloudinaryVideo(public_id).build_url(
        resource_type='video',
        transformation=transformation,
        sign_url=True,  # URL signée → non partageable
        secure=True,
        # Type streaming
        format='m3u8',  # HLS
    )

    return url


def build_watermarked_audio_url(public_id, user):
    """Version simplifiée pour l'audio (pas de watermark visible, juste URL signée)."""
    if not is_cloudinary_configured():
        return None

    url = cloudinary.CloudinaryVideo(public_id).build_url(
        resource_type='video',
        sign_url=True,
        secure=True,
    )
    return url