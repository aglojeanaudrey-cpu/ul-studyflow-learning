from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .realtime_auth import generate_realtime_jwt
from accounts.permissions import IsStaffOrSuperuser
from accounts.models import User
from audit.utils import log_audit
from .models import Notification, NotificationRecipientStatus
from .serializers import NotificationSerializer

def auto_update_scheduled_notifications():
    """Bascule automatiquement les notifications arrivées à échéance au statut SENT."""
    now = timezone.now()
    due_notifications = Notification.objects.filter(
        status='SCHEDULED',
        scheduled_for__lte=now
    )
    for notif in due_notifications:
        notif.status = 'SENT'
        notif.save(update_fields=['status'])


class UserNotificationsListView(APIView):
    """Récupère les notifications destinées à l'utilisateur connecté avec le nombre de non lues."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        auto_update_scheduled_notifications()
        user = request.user
        now = timezone.now()

        # Filter notifications matching this user
        # ⭐ Limiter à 50 dernières pour alléger le payload
        qs = Notification.objects.filter(
            status='SENT'
        ).filter(
            Q(scheduled_for__isnull=True) | Q(scheduled_for__lte=now)
        ).filter(
            Q(target_type='ALL') |
            Q(target_type='USERS', recipients=user) |
            Q(target_type='ROLE', target_role=user.role) |
            Q(target_type='DEPARTMENT', target_department=user.department) |
            Q(target_type='LEVEL', target_level=user.level)
        ).distinct().order_by('-created_at')
        # Total avant pagination
        total_count = qs.count()

        # Limiter à 50
        eligible_notifications = qs[:50]

        serializer = NotificationSerializer(eligible_notifications, many=True, context={'request': request})
        notifications_data = serializer.data

        # Calculate unread count
        read_notification_ids = set(
            NotificationRecipientStatus.objects.filter(
                user=user,
                is_read=True
            ).values_list('notification_id', flat=True)
        )

        unread_count = sum(1 for n in notifications_data if n['id'] not in read_notification_ids)

        return Response({
            'notifications': notifications_data,
            'unreadCount': unread_count,
            'totalCount': total_count,
        })


class NotificationMarkReadView(APIView):
    """Marque une notification spécifique comme lue."""
    permission_classes = [IsAuthenticated]

    def post(self, request, notif_id):
        user = request.user
        try:
            notification = Notification.objects.get(id=notif_id)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        stat, created = NotificationRecipientStatus.objects.get_or_create(
            notification=notification,
            user=user,
            defaults={'is_read': True, 'read_at': timezone.now()}
        )
        if not created and not stat.is_read:
            stat.is_read = True
            stat.read_at = timezone.now()
            stat.save()

        return Response({'success': True, 'notificationId': notif_id})


class NotificationMarkAllReadView(APIView):
    """Marque toutes les notifications de l'utilisateur comme lues."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        now = timezone.now()

        # Find all sent notifications matching this user
        eligible_notifications = Notification.objects.filter(
            status='SENT'
        ).filter(
            Q(scheduled_for__isnull=True) | Q(scheduled_for__lte=now)
        ).filter(
            Q(target_type='ALL') |
            Q(target_type='USERS', recipients=user) |
            Q(target_type='ROLE', target_role=user.role) |
            Q(target_type='DEPARTMENT', target_department=user.department) |
            Q(target_type='LEVEL', target_level=user.level)
        ).distinct()

        for notif in eligible_notifications:
            stat, _ = NotificationRecipientStatus.objects.get_or_create(
                notification=notif,
                user=user,
                defaults={'is_read': True, 'read_at': timezone.now()}
            )
            if not stat.is_read:
                stat.is_read = True
                stat.read_at = timezone.now()
                stat.save()

        return Response({'success': True, 'message': 'Toutes les notifications ont été marquées comme lues.'})


class AdminNotificationsView(APIView):
    """Gestion des notifications administratives (envoi immédiat ou programmé)."""
    permission_classes = [IsAuthenticated, IsStaffOrSuperuser]

    def get(self, request):
        auto_update_scheduled_notifications()
        notifications = Notification.objects.all().order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True, context={'request': request})
        return Response({'notifications': serializer.data})

    def post(self, request):
        data = request.data
        title = data.get('title', '').strip()
        message = data.get('message', '').strip()
        notification_type = data.get('type', 'info')
        priority = data.get('priority', 'normal')
        target_type = data.get('targetType', 'ALL')
        target_role = data.get('targetRole')
        target_department = data.get('targetDepartment')
        target_level = data.get('targetLevel')
        action_url = data.get('actionUrl', '').strip() or None
        scheduled_for_raw = data.get('scheduledFor')
        recipient_user_ids = data.get('recipientUserIds', [])

        if not title or not message:
            return Response({'error': 'Le titre et le message sont obligatoires.'}, status=status.HTTP_400_BAD_REQUEST)

        scheduled_for = None
        status_val = 'SENT'
        if scheduled_for_raw:
            scheduled_for = parse_datetime(scheduled_for_raw)
            if scheduled_for and scheduled_for > timezone.now():
                status_val = 'SCHEDULED'

        notification = Notification.objects.create(
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            target_type=target_type,
            target_role=target_role,
            target_department=target_department,
            target_level=target_level,
            action_url=action_url,
            created_by=request.user,
            scheduled_for=scheduled_for,
            status=status_val
        )

        if target_type == 'USERS' and recipient_user_ids:
            users = User.objects.filter(id__in=recipient_user_ids)
            notification.recipients.set(users)

        log_audit(
            request=request,
            action="CREATE_NOTIFICATION",
            resource=f"Notification: {notification.title}",
            details=f"Type={notification_type}, Cible={target_type}, Statut={status_val}, Programmé pour={scheduled_for_raw or 'Immédiat'}"
        )

        serializer = NotificationSerializer(notification, context={'request': request})
        return Response({'success': True, 'notification': serializer.data}, status=status.HTTP_201_CREATED)


class AdminNotificationDetailView(APIView):
    """Mise à jour et suppression d'une notification."""
    permission_classes = [IsAuthenticated, IsStaffOrSuperuser]

    def put(self, request, notif_id):
        try:
            notification = Notification.objects.get(id=notif_id)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'title' in data:
            notification.title = data['title'].strip()
        if 'message' in data:
            notification.message = data['message'].strip()
        if 'type' in data:
            notification.notification_type = data['type']
        if 'priority' in data:
            notification.priority = data['priority']
        if 'targetType' in data:
            notification.target_type = data['targetType']
        if 'targetRole' in data:
            notification.target_role = data['targetRole']
        if 'targetDepartment' in data:
            notification.target_department = data['targetDepartment']
        if 'targetLevel' in data:
            notification.target_level = data['targetLevel']
        if 'actionUrl' in data:
            notification.action_url = data['actionUrl'].strip() or None

        if 'scheduledFor' in data:
            sched_raw = data['scheduledFor']
            if sched_raw:
                notification.scheduled_for = parse_datetime(sched_raw)
                if notification.scheduled_for and notification.scheduled_for > timezone.now():
                    notification.status = 'SCHEDULED'
                else:
                    notification.status = 'SENT'
            else:
                notification.scheduled_for = None
                notification.status = 'SENT'

        if 'recipientUserIds' in data and notification.target_type == 'USERS':
            users = User.objects.filter(id__in=data['recipientUserIds'])
            notification.recipients.set(users)

        notification.save()

        log_audit(
            request=request,
            action="UPDATE_NOTIFICATION",
            resource=f"Notification: {notification.title}",
            details=f"Statut={notification.status}, Date={notification.scheduled_for}"
        )

        serializer = NotificationSerializer(notification, context={'request': request})
        return Response({'success': True, 'notification': serializer.data})

    def delete(self, request, notif_id):
        try:
            notification = Notification.objects.get(id=notif_id)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        title = notification.title
        notification.delete()

        log_audit(
            request=request,
            action="DELETE_NOTIFICATION",
            resource=f"Notification: {title}",
            details=f"Notification ID {notif_id} supprimée"
        )

        return Response({'success': True, 'message': 'Notification supprimée avec succès.'})


class AdminNotificationSendNowView(APIView):
    """Envoie immédiatement une notification précédemment programmée."""
    permission_classes = [IsAuthenticated, IsStaffOrSuperuser]

    def post(self, request, notif_id):
        try:
            notification = Notification.objects.get(id=notif_id)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        notification.scheduled_for = timezone.now()
        notification.status = 'SENT'
        notification.save()

        log_audit(
            request=request,
            action="SEND_NOTIFICATION_NOW",
            resource=f"Notification: {notification.title}",
            details="Déclenchement immédiat de la notification"
        )

        serializer = NotificationSerializer(notification, context={'request': request})
        return Response({'success': True, 'notification': serializer.data})


class NotificationDeleteView(APIView):
    """
    Supprime une notification.
    - Un SUPERUSER/STAFF peut supprimer n'importe quelle notification.
    - Un USER peut supprimer UNIQUEMENT les notifications qui lui sont destinées.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, notif_id):
        user = request.user

        try:
            notif = Notification.objects.get(id=notif_id)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        # ⭐ Vérification des permissions
        is_admin = user.role in ('STAFF', 'SUPERUSER') or user.is_staff or user.is_superuser

        if not is_admin:
            # Un USER simple ne peut supprimer QUE ses propres notifications
            if not self._user_can_delete(user, notif):
                return Response(
                    {'error': "Vous ne pouvez supprimer que les notifications qui vous sont destinées."},
                    status=status.HTTP_403_FORBIDDEN
                )

        title = notif.title
        notif.delete()

        try:
            log_audit(
                request=request,
                action="DELETE_NOTIFICATION",
                resource=f"Notification: {title}",
                details=f"Suppression notification ID {notif_id} par {user.phone}"
            )
        except Exception:
            pass

        return Response({'success': True, 'message': 'Notification supprimée.'})

    def _user_can_delete(self, user, notif):
        """
        Vérifie si un USER simple peut supprimer cette notification.
        Il faut que la notification soit ciblée vers lui :
        - target_type='USERS' ET user dans recipients
        - target_type='ALL'
        - target_type='ROLE' ET target_role == user.role
        - target_type='DEPARTMENT' ET target_department == user.department
        - target_type='LEVEL' ET target_level == user.level
        """
        if notif.target_type == 'ALL':
            return True
        if notif.target_type == 'USERS':
            return notif.recipients.filter(id=user.id).exists()
        if notif.target_type == 'ROLE':
            return notif.target_role == user.role
        if notif.target_type == 'DEPARTMENT':
            return notif.target_department == user.department
        if notif.target_type == 'LEVEL':
            return notif.target_level == user.level
        return False


class NotificationBulkDeleteView(APIView):
    """
    Supprime plusieurs notifications en masse.
    Body: { ids: ['notif_xxx', 'notif_yyy'] }  OU  { all: true }

    - Un SUPERUSER/STAFF peut tout supprimer.
    - Un USER simple ne peut supprimer QUE les notifications qui lui sont destinées.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        is_admin = user.role in ('STAFF', 'SUPERUSER') or user.is_staff or user.is_superuser

        ids = request.data.get('ids')
        delete_all = bool(request.data.get('all', False))

        if is_admin:
            # Admin : suppression sans restriction
            if delete_all:
                count, _ = Notification.objects.all().delete()
                return Response({'success': True, 'deletedCount': count})

            if not isinstance(ids, list) or not ids:
                return Response({'error': 'Aucun ID fourni.'}, status=status.HTTP_400_BAD_REQUEST)

            count, _ = Notification.objects.filter(id__in=ids).delete()
            return Response({'success': True, 'deletedCount': count})

        # ⭐ USER simple : filtre sur ses propres notifications
        # Construire le queryset des notifications destinées à cet user
        now = timezone.now()
        eligible = Notification.objects.filter(status='SENT').filter(
            Q(scheduled_for__isnull=True) | Q(scheduled_for__lte=now)
        ).filter(
            Q(target_type='ALL') |
            Q(target_type='USERS', recipients=user) |
            Q(target_type='ROLE', target_role=user.role) |
            Q(target_type='DEPARTMENT', target_department=user.department) |
            Q(target_type='LEVEL', target_level=user.level)
        ).distinct()

        if delete_all:
            count, _ = eligible.delete()
            return Response({'success': True, 'deletedCount': count})

        if not isinstance(ids, list) or not ids:
            return Response({'error': 'Aucun ID fourni.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ne supprimer que les notifs éligibles parmi les IDs fournis
        count, _ = eligible.filter(id__in=ids).delete()
        return Response({'success': True, 'deletedCount': count})

class RealtimeTokenView(APIView):
    """
    Émet un JWT court (5 min) signé avec le secret Supabase.
    Le frontend l'utilise pour s'authentifier sur Supabase Realtime.

    Renvoie aussi supabaseUrl + supabaseAnonKey pour que le frontend
    n'ait AUCUNE variable VITE_* à embarquer dans le build Cloudflare.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = generate_realtime_jwt(request.user)
        except RuntimeError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({
            'token': token,
            'expiresIn': settings.SUPABASE_JWT_TTL_SECONDS,
            'supabaseUrl': settings.SUPABASE_URL,
            'supabaseAnonKey': settings.SUPABASE_ANON_KEY,
        })
