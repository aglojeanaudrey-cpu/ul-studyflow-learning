from datetime import timedelta
from django.db.models import Q, Count
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from audit.trash_service import move_to_trash_popup
from accounts.permissions import IsStaffOrSuperuser, IsSuperuserOnly, require_admin_permission
from .models import PopupTemplate, PopupCampaign, PopupView, PopupClick
from .serializers import (
    PopupTemplateSerializer,
    PopupCampaignSerializer,
    PopupCampaignPublicSerializer,
    PopupViewSerializer,
    PopupClickSerializer,
)
from .utils import notify_superusers_about_campaign
# =============================================================================
# VUES PUBLIQUES
# =============================================================================

class ActivePopupsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        page = request.GET.get('page', '').strip()
        if not page:
            return Response({'popup': None})

        user = request.user if request.user and request.user.is_authenticated else None
        now = timezone.now()

        qs = PopupCampaign.objects.filter(is_active=True).filter(
            Q(starts_at__isnull=True) | Q(starts_at__lte=now),
            Q(ends_at__isnull=True) | Q(ends_at__gte=now),
        )

        # Filtre audience
        if user:
            if user.role == 'USER' and not getattr(user, 'is_sponsored', False):
                qs = qs.filter(target_audience__in=['all', 'logged_in', 'students'])
            elif getattr(user, 'is_sponsored', False):
                qs = qs.filter(target_audience__in=['all', 'logged_in', 'students', 'sponsored'])
            else:
                qs = qs.filter(target_audience__in=['all', 'logged_in'])
        else:
            qs = qs.filter(target_audience__in=['all', 'anonymous'])

        # ⭐ Filtrage en Python (compatible SQLite + PostgreSQL)
        matching_popups = []
        for popup in qs.order_by('-priority', '-created_at'):
            # Page cible ?
            target_pages = popup.target_pages or []
            if page not in target_pages:
                continue

            # Segmentation (si user connecté)
            if user:
                deps = popup.target_departments or []
                if deps and user.department not in deps:
                    continue
                progs = popup.target_programs or []
                if progs and user.program not in progs:
                    continue
                lvls = popup.target_levels or []
                if lvls and user.level not in lvls:
                    continue

            # ⭐ Programmation avancée (jours + heures)
            if not popup.is_in_schedule(now):
                continue

            matching_popups.append(popup)
            break

        if not matching_popups:
            return Response({'popup': None})

        popup = matching_popups[0]
        return Response({
            'popup': PopupCampaignPublicSerializer(popup).data
        })

@method_decorator(csrf_exempt, name='dispatch')
class TrackPopupViewView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, popup_id):
        try:
            campaign = PopupCampaign.objects.get(id=popup_id)
        except PopupCampaign.DoesNotExist:
            return Response({'error': 'Popup introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user if request.user and request.user.is_authenticated else None
        page = request.data.get('page', '')

        PopupView.objects.create(
            campaign=campaign,
            user=user,
            user_phone=user.phone if user else '',
            user_role=user.role if user else 'ANONYME',
            user_department=user.department if user else '',
            user_program=user.program if user else '',
            user_level=user.level if user else '',
            page=page,
            ip=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:255],
        )

        PopupCampaign.objects.filter(id=popup_id).update(views_count=campaign.views_count + 1)
        return Response({'success': True})

@method_decorator(csrf_exempt, name='dispatch')
class TrackPopupClickView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, popup_id):
        try:
            campaign = PopupCampaign.objects.get(id=popup_id)
        except PopupCampaign.DoesNotExist:
            return Response({'error': 'Popup introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user if request.user and request.user.is_authenticated else None
        button_type = request.data.get('button_type', 'primary')
        page = request.data.get('page', '')

        if button_type not in ('primary', 'secondary', 'dismiss'):
            button_type = 'primary'

        PopupClick.objects.create(
            campaign=campaign,
            user=user,
            user_phone=user.phone if user else '',
            button_type=button_type,
            page=page,
            ip=request.META.get('REMOTE_ADDR', ''),
        )

        if button_type != 'dismiss':
            PopupCampaign.objects.filter(id=popup_id).update(clicks_count=campaign.clicks_count + 1)

        return Response({'success': True})


# =============================================================================
# VUES ADMIN — CAMPAGNES
# =============================================================================

class AdminPopupsListView(APIView):
    permission_classes = [require_admin_permission('ads')]

    def get(self, request):
        qs = PopupCampaign.objects.all().order_by('-priority', '-created_at')
        return Response({'popups': PopupCampaignSerializer(qs, many=True).data})

    def post(self, request):
    
        serializer = PopupCampaignSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)

        popup = serializer.save(created_by=request.user.phone)

        # ⭐ Notification interne aux superusers
        try:
            notify_superusers_about_campaign(popup, action='created', actor=request.user)
        except Exception as e:
            print(f"[ads] Erreur notification superuser : {e}")

        # Audit
        try:
            from audit.utils import log_audit
            log_audit(
                action='POPUP_CREATE',
                resource=popup.id,
                details=f"Création popup « {popup.title} » ({popup.popup_type})",
                user=request.user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True, 'popup': PopupCampaignSerializer(popup).data}, status=status.HTTP_201_CREATED)


class AdminPopupDetailView(APIView):
    permission_classes = [require_admin_permission('ads')]

    def _get_popup(self, popup_id):
        try:
            return PopupCampaign.objects.get(id=popup_id)
        except PopupCampaign.DoesNotExist:
            return None

    def get(self, request, popup_id):
        popup = self._get_popup(popup_id)
        if not popup:
            return Response({'error': 'Popup introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'popup': PopupCampaignSerializer(popup).data})

    def put(self, request, popup_id):
        popup = self._get_popup(popup_id)
        if not popup:
            return Response({'error': 'Popup introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        was_active = popup.is_active

        serializer = PopupCampaignSerializer(popup, data=request.data, partial=True)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()

        # ⭐ Notification si la campagne vient d'être activée (false → true)
        if not was_active and popup.is_active:
            try:
                notify_superusers_about_campaign(popup, action='published', actor=request.user)
            except Exception as e:
                print(f"[ads] Erreur notification superuser : {e}")

        try:
            from audit.utils import log_audit
            log_audit(
                action='POPUP_UPDATE',
                resource=popup.id,
                details=f"Mise à jour popup « {popup.title} »",
                user=request.user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True, 'popup': PopupCampaignSerializer(popup).data})

    def delete(self, request, popup_id):
        popup = self._get_popup(popup_id)
        if not popup:
            return Response({'error': 'Popup introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        # ⭐ Déplacement vers la corbeille
        try:
            entry = move_to_trash_popup(popup, deleted_by=request.user)

            try:
                from audit.utils import log_audit
                log_audit(
                    action='POPUP_DELETE',
                    resource=popup_id,
                    details=f"Popup « {entry.display_name} » déplacé vers la corbeille",
                    user=request.user,
                    ip=request.META.get('REMOTE_ADDR')
                )
            except Exception:
                pass

            return Response({
                'success': True,
                'message': "Campagne déplacée vers la corbeille. Restaurable 30 jours.",
                'trashId': entry.id,
            })
        except Exception as e:
            return Response(
                {'error': f"Erreur lors de la suppression : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminPopupToggleView(APIView):
    permission_classes = [require_admin_permission('ads')]

    def put(self, request, popup_id):
        try:
            popup = PopupCampaign.objects.get(id=popup_id)
        except PopupCampaign.DoesNotExist:
            return Response({'error': 'Popup introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        was_active = popup.is_active
        popup.is_active = not popup.is_active
        popup.save(update_fields=['is_active'])

        # ⭐ Notification si activée
        if not was_active and popup.is_active:
            try:
                notify_superusers_about_campaign(popup, action='published', actor=request.user)
            except Exception as e:
                print(f"[ads] Erreur notification superuser : {e}")

        return Response({'success': True, 'isActive': popup.is_active})


class AdminPopupStatsView(APIView):
    permission_classes = [require_admin_permission('ads')]

    def get(self, request, popup_id):
        try:
            popup = PopupCampaign.objects.get(id=popup_id)
        except PopupCampaign.DoesNotExist:
            return Response({'error': 'Popup introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        range_param = request.GET.get('range', 'week')
        now = timezone.now()
        since = {
            'day': now - timedelta(days=1),
            'week': now - timedelta(days=7),
            'month': now - timedelta(days=30),
            'year': now - timedelta(days=365),
        }.get(range_param, now - timedelta(days=7))

        views_qs = PopupView.objects.filter(campaign=popup, viewed_at__gte=since)
        clicks_qs = PopupClick.objects.filter(campaign=popup, clicked_at__gte=since)

        from django.db.models.functions import TruncDate
        views_by_day = (
            views_qs.annotate(day=TruncDate('viewed_at'))
            .values('day').annotate(count=Count('id')).order_by('day')
        )
        clicks_by_day = (
            clicks_qs.annotate(day=TruncDate('clicked_at'))
            .values('day').annotate(count=Count('id')).order_by('day')
        )
        clicks_by_button = (
            clicks_qs.values('button_type').annotate(count=Count('id')).order_by('-count')
        )
        top_users = (
            views_qs.exclude(user_phone='')
            .values('user_phone', 'user_department', 'user_level')
            .annotate(view_count=Count('id')).order_by('-view_count')[:5]
        )

        return Response({
            'popup': {
                'id': popup.id,
                'title': popup.title,
                'type': popup.popup_type,
            },
            'range': range_param,
            'totalViews': popup.views_count,
            'totalClicks': popup.clicks_count,
            'ctr': popup.click_through_rate,
            'periodViews': views_qs.count(),
            'periodClicks': clicks_qs.count(),
            'viewsByDay': [
                {'date': item['day'].isoformat() if item['day'] else None, 'count': item['count']}
                for item in views_by_day
            ],
            'clicksByDay': [
                {'date': item['day'].isoformat() if item['day'] else None, 'count': item['count']}
                for item in clicks_by_day
            ],
            'clicksByButton': list(clicks_by_button),
            'topUsers': list(top_users),
        })


class AdminPopupViewersView(APIView):
    permission_classes = [require_admin_permission('ads')]

    def get(self, request, popup_id):
        try:
            popup = PopupCampaign.objects.get(id=popup_id)
        except PopupCampaign.DoesNotExist:
            return Response({'error': 'Popup introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        qs = PopupView.objects.filter(campaign=popup).select_related('user').order_by('-viewed_at')[:500]
        return Response({'views': PopupViewSerializer(qs, many=True).data})


# =============================================================================
# VUES ADMIN — TEMPLATES
# =============================================================================

class AdminPopupTemplatesView(APIView):
    """Liste + création de templates."""
    permission_classes = [require_admin_permission('ads')]

    def get(self, request):
        qs = PopupTemplate.objects.all().order_by('-is_system', 'name')
        return Response({'templates': PopupTemplateSerializer(qs, many=True).data})

    def post(self, request):
        serializer = PopupTemplateSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)

        template = serializer.save(created_by=request.user.phone)
        return Response({'success': True, 'template': PopupTemplateSerializer(template).data}, status=status.HTTP_201_CREATED)


class AdminPopupTemplateDetailView(APIView):
    """Détail, mise à jour et suppression d'un template."""
    permission_classes = [require_admin_permission('ads')]

    def _get_template(self, template_id):
        try:
            return PopupTemplate.objects.get(id=template_id)
        except PopupTemplate.DoesNotExist:
            return None

    def get(self, request, template_id):
        template = self._get_template(template_id)
        if not template:
            return Response({'error': 'Template introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'template': PopupTemplateSerializer(template).data})

    def put(self, request, template_id):
        template = self._get_template(template_id)
        if not template:
            return Response({'error': 'Template introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PopupTemplateSerializer(template, data=request.data, partial=True)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response({'success': True, 'template': PopupTemplateSerializer(template).data})

    def delete(self, request, template_id):
        template = self._get_template(template_id)
        if not template:
            return Response({'error': 'Template introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        # Seul un superuser peut supprimer un template système
        if template.is_system and request.user.role != 'SUPERUSER':
            return Response(
                {'error': 'Seul le Super-Administrateur peut supprimer un template système.'},
                status=status.HTTP_403_FORBIDDEN
            )

        template.delete()
        return Response({'success': True})