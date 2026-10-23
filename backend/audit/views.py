import csv
from io import StringIO
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import AuditLog
from .serializers import AuditLogSerializer
from .utils import log_audit
from accounts.permissions import IsStaffOrSuperuser, IsSuperuserOnly, require_admin_permission
from accounts.models import User
from accounts.authentication import ULSFTokenAuthentication
from courses.models import UE, Session, QuizAttempt, SessionProgress
from forms_builder.models import DynamicForm, FormSubmission
from monetization.models import PlatformConfig
from .trash_service import purge_expired_trash
from accounts.models import PartnershipRequest, ContactMessage
from .serializers import PartnershipRequestSerializer, ContactMessageSerializer
from .utils import notify_admins

class AuditLogsListView(APIView):
    permission_classes = [IsSuperuserOnly]

    def get(self, request):
        logs = AuditLog.objects.all().order_by('-timestamp')[:500]
        return Response({'logs': AuditLogSerializer(logs, many=True).data})

    def delete(self, request):
        """
        Suppression de logs par le SUPERUSER uniquement.
        Body:
          { "ids": ["log_1", "log_2"] }  → suppression ciblée
          { "all": true }                 → purge totale
        """
        ids = request.data.get('ids')
        purge_all = bool(request.data.get('all', False))
        actor = request.user

        if purge_all:
            count = AuditLog.objects.count()
            # ⚠️ On log l'action AVANT de purger (car après, on aura tout effacé)
            log_audit(
                action='AUDIT_LOGS_PURGE_ALL',
                resource='AUDIT',
                details=f"PURGE TOTALE : {count} log(s) supprimé(s) par {actor.phone}",
                user=actor,
                ip=request.META.get('REMOTE_ADDR')
            )
            AuditLog.objects.all().delete()
            return Response({'success': True, 'deletedCount': count})

        if not isinstance(ids, list) or not ids:
            return Response(
                {'error': 'Aucun ID fourni pour la suppression.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        count, _ = AuditLog.objects.filter(id__in=ids).delete()

        # Log de traçabilité
        log_audit(
            action='AUDIT_LOGS_DELETE',
            resource='AUDIT',
            details=f"Suppression de {count} log(s) par {actor.phone}",
            user=actor,
            ip=request.META.get('REMOTE_ADDR')
        )

        return Response({'success': True, 'deletedCount': count})


class ContactView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        name = request.data.get('name', '').strip()
        phone = request.data.get('phone', '').strip()
        subject = request.data.get('subject', 'Général').strip()
        message = request.data.get('message', '').strip()
        email = request.data.get('email', '').strip()

        if not name or not phone or not message:
            return Response(
                {'error': 'Veuillez remplir votre nom, numéro et message.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Enregistrer en base
        entry = ContactMessage.objects.create(
            name=name,
            phone=phone,
            email=email,
            subject=subject,
            message=message,
            user=request.user if request.user.is_authenticated else None,
            ip=request.META.get('REMOTE_ADDR'),
        )

        # 2. Audit (signature compatible avec log_audit existant)
        log_audit(
            action='CONTACT_MESSAGE',
            resource='PUBLIC_CONTACT',
            details=(
                f"Message de {name} ({phone}) - Sujet: {subject} : "
                f"{message[:120]}..."
            ),
            user={'phone': phone, 'role': 'VISITEUR'},
            ip=request.META.get('REMOTE_ADDR'),
        )

        # 3. Notifier les admins (temps réel via Supabase Realtime)
        try:
            from notifications.utils import notify_admins
            notify_admins(
                title="Nouveau message de contact",
                message=f"{name} ({phone}) : {subject}",
                action_url="/admin/contact", 
                priority="normal",
                notification_type="info",
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(
                f"notify_admins failed in ContactView: {e}"
            )

        return Response({
            'success': True,
            'message': (
                'Votre message a bien été envoyé. '
                'Notre équipe à Lomé vous répondra sous 24h.'
            ),
        })


class AdminStatsView(APIView):
    authentication_classes = [ULSFTokenAuthentication]
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        students_count = User.objects.filter(role='USER').count()
        staff_count = User.objects.filter(role__in=['STAFF', 'SUPERUSER']).count()
        ues_count = UE.objects.count()
        sessions_count = Session.objects.count()
        quiz_attempts_count = QuizAttempt.objects.count()
        forms_count = DynamicForm.objects.count()
        submissions_count = FormSubmission.objects.count()

        config = PlatformConfig.get_solo()

        return Response({
            'studentsCount': students_count,
            'staffCount': staff_count,
            'uesCount': ues_count,
            'sessionsCount': sessions_count,
            'quizAttemptsCount': quiz_attempts_count,
            'activeYear': config.academic_year_current,
            'formsCount': forms_count,
            'submissionsCount': submissions_count
        })


class AdminExportView(APIView):
    """
    Export CSV/JSON des données (users, progress, quiz_attempts, submissions, audit).
    Accès : SUPERUSER + STAFF avec permission 'export'.
    """
    permission_classes = [require_admin_permission('export')]

    def get(self, request, export_type):
        fmt = (
            request.GET.get('export_format')
            or request.GET.get('format')  # rétrocompatibilité
            or 'json'
        ).lower()
        filename = f"ul_study_flow_{export_type}_{int(timezone.now().timestamp())}"
        data = []

        if export_type == 'users':
            users = User.objects.all().order_by('-created_at')
            for u in users:
                data.append({
                    'id': u.id,
                    'phone': u.display_phone or u.phone,
                    'firstName': u.first_name,
                    'lastName': u.last_name,
                    'department': u.department,
                    'program': u.program,
                    'level': u.level,
                    'role': u.role,
                    'isActive': 'Oui' if u.is_active else 'Non',
                    'createdAt': u.created_at.strftime('%d/%m/%Y %H:%M')
                })

        elif export_type == 'progress':
            progs = SessionProgress.objects.select_related('user', 'session', 'ue').order_by('-last_accessed_at')
            for p in progs:
                data.append({
                    'studentName': f"{p.user.first_name} {p.user.last_name}" if p.user else '',
                    'studentPhone': p.user.display_phone or p.user.phone if p.user else '',
                    'ueCode': p.ue.code if p.ue else '',
                    'sessionTitle': p.session.title if p.session else '',
                    'status': p.status,
                    'completedAt': p.completed_at.strftime('%d/%m/%Y %H:%M') if p.completed_at else ''
                })

        elif export_type == 'quiz_attempts':
            attempts = QuizAttempt.objects.select_related('user', 'session').order_by('-submitted_at')
            for a in attempts:
                data.append({
                    'studentName': f"{a.user.first_name} {a.user.last_name}" if a.user else '',
                    'sessionTitle': a.session.title if a.session else '',
                    'score': a.score,
                    'maxScore': a.max_score,
                    'percentage': f"{a.percentage}%",
                    'passed': 'Oui' if a.passed else 'Non',
                    'submittedAt': a.submitted_at.strftime('%d/%m/%Y %H:%M')
                })

        elif export_type == 'submissions':
            subs = FormSubmission.objects.select_related('form').order_by('-submitted_at')
            for s in subs:
                data.append({
                    'id': s.id,
                    'formTitle': s.form.title if s.form else '',
                    'userName': s.user_name,
                    'userPhone': s.user_phone,
                    'submittedAt': s.submitted_at.strftime('%d/%m/%Y %H:%M'),
                    'data': str(s.data)
                })

        elif export_type == 'audit':
            logs = AuditLog.objects.all().order_by('-timestamp')[:500]
            for l in logs:
                data.append({
                    'id': l.id,
                    'timestamp': l.timestamp.strftime('%d/%m/%Y %H:%M:%S'),
                    'userPhone': l.user_phone,
                    'userRole': l.user_role,
                    'action': l.action,
                    'resource': l.resource,
                    'details': l.details,
                    'ip': l.ip
                })
        else:
            return Response({'error': "Type d'export invalide."}, status=status.HTTP_400_BAD_REQUEST)

        if fmt == 'csv':
            output = StringIO()
            output.write('\ufeff')  # UTF-8 BOM pour Excel
            if data:
                headers = list(data[0].keys())
                writer = csv.DictWriter(output, fieldnames=headers, delimiter=';', quoting=csv.QUOTE_MINIMAL)
                writer.writeheader()
                for row in data:
                    writer.writerow(row)
            else:
                output.write("Aucune donnée disponible\n")

            response = HttpResponse(output.getvalue(), content_type='text/csv; charset=utf-8')
            response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
            # CORS : permet au navigateur de lire le nom du fichier
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
            return response

        # JSON : retour direct
        return Response(data)


# =============================================================================
# CORBEILLE (SUPERUSER uniquement)
# =============================================================================

class AdminTrashListView(APIView):
    """Liste les éléments de la corbeille avec filtres."""
    permission_classes = [IsSuperuserOnly]

    def get(self, request):
        # Lazy purge : nettoie les expirés à chaque chargement
        try:
            purge_expired_trash()
        except Exception:
            pass

        from .models import TrashBin
        from .serializers import TrashBinSerializer

        qs = TrashBin.objects.filter(is_restored=False).select_related('deleted_by', 'restored_by')

        # Filtres
        object_type = request.GET.get('type', '').strip()
        if object_type and object_type != 'ALL':
            qs = qs.filter(object_type=object_type)

        search = request.GET.get('q', '').strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(display_name__icontains=search) |
                Q(object_id__icontains=search) |
                Q(deleted_by_phone__icontains=search)
            )

        # Stats
        from django.db.models import Count
        stats_by_type = (
            TrashBin.objects.filter(is_restored=False)
            .values('object_type')
            .annotate(count=Count('id'))
        )

        total_count = TrashBin.objects.filter(is_restored=False).count()

        return Response({
            'items': TrashBinSerializer(qs[:500], many=True).data,
            'total': qs.count(),
            'totalInTrash': total_count,
            'stats': list(stats_by_type),
        })


class AdminTrashRestoreView(APIView):
    """Restaure un élément depuis la corbeille."""
    permission_classes = [IsSuperuserOnly]

    def post(self, request, trash_id):
        from .models import TrashBin
        from .trash_service import restore_from_trash

        try:
            entry = TrashBin.objects.get(id=trash_id)
        except TrashBin.DoesNotExist:
            return Response({'error': 'Élément de corbeille introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if entry.is_restored:
            return Response({'error': 'Cet élément a déjà été restauré.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            restore_from_trash(entry, request.user)

            try:
                from audit.utils import log_audit
                log_audit(
                    action='TRASH_RESTORE',
                    resource=entry.object_id,
                    details=f"Restauration {entry.object_type} : {entry.display_name}",
                    user=request.user,
                    ip=request.META.get('REMOTE_ADDR')
                )
            except Exception:
                pass

            return Response({'success': True, 'message': 'Élément restauré avec succès.'})
        except Exception as e:
            return Response(
                {'error': f"Erreur restauration : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminTrashDeleteView(APIView):
    """Supprime définitivement un élément de la corbeille."""
    permission_classes = [IsSuperuserOnly]

    def delete(self, request, trash_id):
        from .models import TrashBin
        if trash_id in ('purge-all', 'trash-bulk-action'):
            return Response(
                {'error': 'Route réservée. Utilisez les endpoints dédiés.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            entry = TrashBin.objects.get(id=trash_id)
        except TrashBin.DoesNotExist:
            return Response({'error': 'Élément introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        display_name = entry.display_name
        object_type = entry.object_type
        entry.delete()

        try:
            from audit.utils import log_audit
            log_audit(
                action='TRASH_PERMANENT_DELETE',
                resource=trash_id,
                details=f"Suppression définitive {object_type} : {display_name}",
                user=request.user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True})


class AdminTrashBulkActionView(APIView):
    """
    Actions en masse : restauration multiple OU purge multiple.
    Body: { action: 'restore' | 'purge', ids: [...] }
    """
    permission_classes = [IsSuperuserOnly]

    def post(self, request):
        from .models import TrashBin
        from .trash_service import restore_from_trash

        action = request.data.get('action', '')
        ids = request.data.get('ids', [])

        if action not in ('restore', 'purge'):
            return Response({'error': 'Action invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(ids, list) or not ids:
            return Response({'error': 'Aucun ID fourni.'}, status=status.HTTP_400_BAD_REQUEST)

        entries = TrashBin.objects.filter(id__in=ids)
        success_count = 0
        errors = []

        for entry in entries:
            try:
                if action == 'restore':
                    if not entry.is_restored and not entry.is_expired:
                        restore_from_trash(entry, request.user)
                        success_count += 1
                    else:
                        errors.append(f"{entry.display_name} : déjà restauré ou expiré")
                elif action == 'purge':
                    entry.delete()
                    success_count += 1
            except Exception as e:
                errors.append(f"{entry.display_name} : {str(e)}")

        return Response({
            'success': True,
            'processed': success_count,
            'errors': errors,
        })


class AdminTrashPurgeAllView(APIView):
    """Vide complètement la corbeille."""
    permission_classes = [IsSuperuserOnly]

    def delete(self, request):
        from .models import TrashBin

        count = TrashBin.objects.filter(is_restored=False).count()
        TrashBin.objects.filter(is_restored=False).delete()

        try:
            from audit.utils import log_audit
            log_audit(
                action='TRASH_PURGE_ALL',
                resource='TRASH',
                details=f"Purge totale : {count} éléments supprimés définitivement",
                user=request.user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True, 'deletedCount': count})


# ═══════════════════════════════════════════════════════════════
# PARTENARIAT (Public + Admin)
# ═══════════════════════════════════════════════════════════════

class SubmitPartnershipRequestView(APIView):
    """Formulaire public : proposer sa filière / rejoindre le projet."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        full_name = (data.get('fullName') or '').strip()
        phone = (data.get('phone') or '').strip()
        department = (data.get('department') or '').strip()
        program = (data.get('program') or '').strip()
        level = (data.get('level') or '').strip()
        motivation = (data.get('motivation') or '').strip()

        if not all([full_name, phone, department, program, level, motivation]):
            return Response(
                {'error': 'Tous les champs obligatoires doivent être remplis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        entry = PartnershipRequest.objects.create(
            user=request.user if request.user.is_authenticated else None,
            full_name=full_name,
            phone=phone,
            email=(data.get('email') or '').strip(),
            department=department,
            program=program,
            level=level,
            is_delegate=bool(data.get('isDelegate', False)),
            motivation=motivation,
            contribution=(data.get('contribution') or '').strip(),
        )

        log_audit(
            request=request,
            action='PARTNERSHIP_REQUEST',
            resource=f'Partnership: {entry.id}',
            details=f"Demande de {full_name} ({department} - {program} - {level})",
        )

        # Notifier les admins en temps réel
        try:
            notify_admins(
                title="Nouvelle demande de partenariat",
                message=f"{full_name} ({department}) souhaite rejoindre le projet.",
                action_url="/admin/partnerships",
                priority="normal",
                notification_type="info",
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"notify_admins failed: {e}")

        return Response({
            'success': True,
            'message': 'Merci ! Ta demande a bien été reçue. Nous te contacterons bientôt.',
            'requestId': entry.id,
        }, status=status.HTTP_201_CREATED)


class AdminPartnershipRequestsView(APIView):
    """Liste et gestion des demandes de partenariat."""
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        qs = PartnershipRequest.objects.all().order_by('-created_at')
        status_filter = request.GET.get('status', '').strip()
        if status_filter and status_filter != 'ALL':
            qs = qs.filter(status=status_filter)
        return Response({
            'requests': PartnershipRequestSerializer(qs[:200], many=True).data,
            'total': qs.count(),
            'pendingCount': PartnershipRequest.objects.filter(status='pending').count(),
        })


class AdminPartnershipRequestDetailView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def put(self, request, req_id):
        try:
            entry = PartnershipRequest.objects.get(id=req_id)
        except PartnershipRequest.DoesNotExist:
            return Response({'error': 'Demande introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status in dict(PartnershipRequest.STATUS_CHOICES):
            entry.status = new_status
            entry.reviewed_at = timezone.now()
            entry.reviewed_by = request.user
        if 'adminNote' in request.data:
            entry.admin_note = request.data['adminNote']

        entry.save()
        log_audit(
            request=request,
            action='PARTNERSHIP_REVIEW',
            resource=f'Partnership: {entry.id}',
            details=f"Statut → {entry.status}",
        )
        return Response({'success': True, 'request': PartnershipRequestSerializer(entry).data})

    def delete(self, request, req_id):
        try:
            entry = PartnershipRequest.objects.get(id=req_id)
        except PartnershipRequest.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        entry.delete()
        return Response({'success': True})


# ═══════════════════════════════════════════════════════════════
# CONTACT (Admin — le POST public existe déjà dans ContactView)
# ═══════════════════════════════════════════════════════════════

class AdminContactMessagesView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        qs = ContactMessage.objects.all().order_by('-created_at')
        status_filter = request.GET.get('status', '').strip()
        if status_filter and status_filter != 'ALL':
            qs = qs.filter(status=status_filter)
        return Response({
            'messages': ContactMessageSerializer(qs[:200], many=True).data,
            'total': qs.count(),
            'newCount': ContactMessage.objects.filter(status='new').count(),
        })


class AdminContactMessageDetailView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def put(self, request, msg_id):
        try:
            msg = ContactMessage.objects.get(id=msg_id)
        except ContactMessage.DoesNotExist:
            return Response({'error': 'Message introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if 'status' in request.data and request.data['status'] in dict(ContactMessage.STATUS_CHOICES):
            msg.status = request.data['status']
        if 'adminNote' in request.data:
            msg.admin_note = request.data['adminNote']
        msg.handled_by = request.user
        msg.save()
        return Response({'success': True, 'message': ContactMessageSerializer(msg).data})

    def delete(self, request, msg_id):
        try:
            ContactMessage.objects.get(id=msg_id).delete()
        except ContactMessage.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'success': True})
