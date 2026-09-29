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
from accounts.permissions import IsStaffOrSuperuser, IsSuperuserOnly
from accounts.models import User
from courses.models import UE, Session, QuizAttempt, SessionProgress
from forms_builder.models import DynamicForm, FormSubmission
from monetization.models import PlatformConfig

class AuditLogsListView(APIView):
    permission_classes = [IsSuperuserOnly]

    def get(self, request):
        logs = AuditLog.objects.all().order_by('-timestamp')[:200]
        return Response({'logs': AuditLogSerializer(logs, many=True).data})


class ContactView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        name = request.data.get('name', '').strip()
        phone = request.data.get('phone', '').strip()
        subject = request.data.get('subject', 'Général').strip()
        message = request.data.get('message', '').strip()

        if not name or not phone or not message:
            return Response({'error': 'Veuillez remplir votre nom, numéro et message.'}, status=status.HTTP_400_BAD_REQUEST)

        log_audit(
            action='CONTACT_MESSAGE',
            resource='PUBLIC_CONTACT',
            details=f"Message de {name} ({phone}) - Sujet: {subject} : {message[:120]}...",
            user={'phone': phone, 'role': 'VISITEUR'},
            ip=request.META.get('REMOTE_ADDR')
        )

        return Response({
            'success': True,
            'message': 'Votre message a bien été envoyé. Notre équipe à Lomé vous répondra sous 24h.'
        })


class AdminStatsView(APIView):
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
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request, export_type):
        fmt = request.GET.get('format', 'json').lower()
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
            output.write('\ufeff') # UTF-8 BOM
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
            return response

        return Response(data)
