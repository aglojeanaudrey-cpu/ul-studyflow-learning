from django.db.models.signals import pre_delete
from django.dispatch import receiver

from .models import TrashBin


def _delete_snapshot_cloudinary_media(snapshot, object_type):
    """
    Supprime les médias Cloudinary référencés dans un snapshot de corbeille.

    Appelée uniquement lors de la purge définitive d'un TrashBin, jamais lors
    de la mise en corbeille (sinon la restauration casserait les URLs).
    """
    from courses.cloudinary_service import delete_media
    import logging

    logger = logging.getLogger(__name__)

    def _delete_chapter_media(chap_data):
        if not isinstance(chap_data, dict):
            return
        for field_name, resource_type in (
            ('video', 'video'),
            ('audio', 'video'),
            ('pdf', 'raw'),
        ):
            media = chap_data.get(field_name) or {}
            public_id = media.get('public_id') if isinstance(media, dict) else None
            if public_id:
                try:
                    delete_media(public_id, resource_type=resource_type)
                except Exception as e:
                    logger.warning(
                        f"Impossible de supprimer {field_name} {public_id} : {e}"
                    )

    if object_type == 'ue':
        for sess in snapshot.get('sessions', []):
            for chap in sess.get('chapters', []):
                _delete_chapter_media(chap)
    elif object_type == 'session':
        for chap in snapshot.get('chapters', []):
            _delete_chapter_media(chap)
    elif object_type == 'chapter':
        _delete_chapter_media(snapshot.get('chapter', {}))


@receiver(pre_delete, sender=TrashBin)
def purge_cloudinary_media_from_trash(sender, instance, **kwargs):
    """
    Purge les médias Cloudinary quand un élément de corbeille est purgé
    définitivement (purge manuelle, purge auto après 30j, purge en masse,
    purge totale).
    """
    try:
        _delete_snapshot_cloudinary_media(
            instance.snapshot or {},
            instance.object_type,
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(
            f"Erreur purge Cloudinary pour TrashBin {instance.id} : {e}"
        )