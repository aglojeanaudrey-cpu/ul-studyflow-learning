from django.utils import timezone
from django.db.models import Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import UE, Session, Quiz, QuizQuestion, UserUEAccess, SessionProgress, QuizAttempt
from .serializers import UESerializer, SessionSerializer, QuizAttemptSerializer
from accounts.permissions import IsStaffOrSuperuser

class CourseCatalogView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        ues = UE.objects.filter(is_published=True, is_suspended=False).order_by('order', 'code')
        serializer = UESerializer(ues, many=True, context={'request': request})
        return Response({'courses': serializer.data})


class MyCoursesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role in ('SUPERUSER', 'STAFF') or user.is_superuser or user.is_staff or user.is_sponsored:
            ues = UE.objects.filter(is_published=True, is_suspended=False).order_by('order', 'code')
        else:
            access_ue_ids = UserUEAccess.objects.filter(user=user, status='active').values_list('ue_id', flat=True)
            ues = UE.objects.filter(id__in=access_ue_ids, is_published=True, is_suspended=False).order_by('order', 'code')

        serializer = UESerializer(ues, many=True, context={'request': request})
        return Response({'myCourses': serializer.data})


class CourseDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, ue_id):
        try:
            ue = UE.objects.select_related('department', 'program').get(id=ue_id)
        except UE.DoesNotExist:
            return Response({'error': "Unité d'Enseignement non trouvée."}, status=status.HTTP_404_NOT_FOUND)

        sessions = ue.sessions.filter(is_published=True, is_suspended=False).order_by('order', 'session_number')

        ue_serializer = UESerializer(ue, context={'request': request})
        session_serializer = SessionSerializer(sessions, many=True, context={'request': request})

        return Response({
            'ue': ue_serializer.data,
            'sessions': session_serializer.data
        })


class SessionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, session_id):
        user = request.user
        try:
            session = Session.objects.select_related('ue').get(id=session_id)
        except Session.DoesNotExist:
            return Response({'error': 'Séance non trouvée.'}, status=status.HTTP_404_NOT_FOUND)

        ue = session.ue

        # Règles d'accès pédagogiques UL Study Flow :
        # 1. La séance 1 de chaque UE est TOUJOURS gratuite et accessible à tous les étudiants inscrits !
        # 2. Les séances suivantes (> 1) nécessitent un accès accordé ou le statut staff/sponsorisé.
        is_first_session = (session.session_number == 1)
        is_staff_or_super = user.role in ('SUPERUSER', 'STAFF') or user.is_superuser or user.is_staff
        is_sponsored = bool(user.is_sponsored)
        has_ue_access = UserUEAccess.objects.filter(user=user, ue=ue, status='active').exists()
        is_explicitly_unlocked = (session.is_locked_for_users is False)
        is_explicitly_blocked = (session.is_locked_for_users is True)

        can_access = False
        if is_first_session or is_staff_or_super or is_sponsored:
            can_access = True
        elif has_ue_access and not is_explicitly_blocked:
            can_access = True
        elif is_explicitly_unlocked:
            can_access = True

        if not can_access:
            return Response({
                'error': 'Cette séance est bloquée pour votre compte étudiant. Seule la 1ère séance de chaque UE est gratuite et accessible. Pour débloquer les autres séances, faites une demande de déblocage.',
                'isLocked': True,
                'ueId': ue.id,
                'ueCode': ue.code,
                'ueTitle': ue.title,
                'uePrice': ue.price_fcfa
            }, status=status.HTTP_403_FORBIDDEN)

        # Enregistrement automatique de la progression (in_progress)
        progress, _ = SessionProgress.objects.get_or_create(
            user=user,
            session=session,
            defaults={
                'ue': ue,
                'status': 'in_progress',
                'last_accessed_at': timezone.now()
            }
        )
        progress.last_accessed_at = timezone.now()
        progress.save(update_fields=['last_accessed_at'])

        # Dernière tentative au quiz si existante
        last_attempt_data = None
        if hasattr(session, 'quiz'):
            last_attempt = QuizAttempt.objects.filter(user=user, session=session).order_by('-submitted_at').first()
            if last_attempt:
                last_attempt_data = QuizAttemptSerializer(last_attempt).data

        session_serializer = SessionSerializer(session, context={'request': request})

        return Response({
            'session': session_serializer.data,
            'ueTitle': ue.title,
            'ueCode': ue.code,
            'progressStatus': progress.status,
            'lastQuizAttempt': last_attempt_data
        })


class SessionCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        user = request.user
        try:
            session = Session.objects.select_related('ue').get(id=session_id)
        except Session.DoesNotExist:
            return Response({'error': 'Séance non trouvée.'}, status=status.HTTP_404_NOT_FOUND)

        progress, _ = SessionProgress.objects.get_or_create(
            user=user,
            session=session,
            defaults={'ue': session.ue, 'status': 'completed', 'completed_at': timezone.now()}
        )
        progress.status = 'completed'
        progress.completed_at = timezone.now()
        progress.last_accessed_at = timezone.now()
        progress.save()

        try:
            from audit.utils import log_audit
            log_audit(
                action='SESSION_COMPLETE',
                resource=session.id,
                details=f"Validation de la séance {session.session_number} ({session.title})",
                user=user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True, 'status': progress.status})


class QuizSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id):
        user = request.user
        answers = request.data.get('answers', {})

        try:
            quiz = Quiz.objects.select_related('session', 'session__ue').prefetch_related('questions').get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({'error': 'Questionnaire introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        total_score = 0
        max_score = 0
        corrections = []

        questions = list(quiz.questions.all().order_by('order', 'id'))
        for q in questions:
            max_score += q.points
            user_ans = answers.get(q.id)
            is_correct = False

            if q.question_type in ('single', 'boolean'):
                is_correct = str(user_ans).strip().lower() == str(q.correct_answer).strip().lower()
            elif q.question_type == 'multiple':
                c_list = q.correct_answer if isinstance(q.correct_answer, list) else [q.correct_answer]
                u_list = user_ans if isinstance(user_ans, list) else [user_ans]
                c_set = set(str(x).strip().lower() for x in c_list)
                u_set = set(str(x).strip().lower() for x in u_list if x is not None)
                is_correct = (c_set == u_set)

            earned = q.points if is_correct else 0
            total_score += earned

            corrections.append({
                'questionId': q.id,
                'questionText': q.text,
                'userAnswer': user_ans,
                'correctAnswer': q.correct_answer,
                'isCorrect': is_correct,
                'explanation': q.explanation,
                'points': q.points,
                'earnedPoints': earned
            })

        percentage = round((total_score / max_score) * 100) if max_score > 0 else 100
        passed = percentage >= quiz.passing_score_percent

        attempt = QuizAttempt.objects.create(
            user=user,
            quiz=quiz,
            session=quiz.session,
            ue=quiz.session.ue,
            score=total_score,
            max_score=max_score,
            percentage=percentage,
            passed=passed,
            user_answers=answers,
            submitted_at=timezone.now()
        )

        # Si le quiz est réussi, marquer la séance comme complétée
        if passed:
            progress, _ = SessionProgress.objects.get_or_create(
                user=user,
                session=quiz.session,
                defaults={'ue': quiz.session.ue, 'status': 'completed', 'completed_at': timezone.now()}
            )
            progress.status = 'completed'
            progress.completed_at = timezone.now()
            progress.save()

        try:
            from audit.utils import log_audit
            log_audit(
                action='QUIZ_SUBMISSION',
                resource=quiz.id,
                details=f"Score: {total_score}/{max_score} ({percentage}%) - {'Réussi' if passed else 'À refaire'}",
                user=user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({
            'attempt': QuizAttemptSerializer(attempt).data,
            'corrections': corrections,
            'passingScorePercent': quiz.passing_score_percent
        })


class StudentProgressOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # UEs accessibles
        if user.role in ('SUPERUSER', 'STAFF') or user.is_superuser or user.is_staff or user.is_sponsored:
            user_ues = UE.objects.filter(is_published=True, is_suspended=False)
        else:
            ue_ids = UserUEAccess.objects.filter(user=user, status='active').values_list('ue_id', flat=True)
            user_ues = UE.objects.filter(id__in=ue_ids, is_published=True, is_suspended=False)

        user_progresses = {p.session_id: p for p in SessionProgress.objects.filter(user=user)}
        user_attempts = QuizAttempt.objects.filter(user=user).select_related('session', 'ue')

        ue_breakdown = []
        total_sessions_all = 0
        total_completed_all = 0

        for ue in user_ues:
            ue_sessions = list(ue.sessions.filter(is_published=True, is_suspended=False))
            total_sessions = len(ue_sessions)
            completed_sessions = sum(1 for s in ue_sessions if user_progresses.get(s.id) and user_progresses[s.id].status == 'completed')
            progress_percent = min(100, round((completed_sessions / total_sessions) * 100)) if total_sessions > 0 else 0

            ue_atts = [a for a in user_attempts if a.ue_id == ue.id]
            avg_score = round(sum(a.percentage for a in ue_atts) / len(ue_atts)) if ue_atts else None

            total_sessions_all += total_sessions
            total_completed_all += completed_sessions

            ue_breakdown.append({
                'ueId': ue.id,
                'ueCode': ue.code,
                'ueTitle': ue.title,
                'totalSessions': total_sessions,
                'completedSessions': completed_sessions,
                'progressPercent': progress_percent,
                'avgQuizScore': avg_score
            })

        global_progress = min(100, round((total_completed_all / total_sessions_all) * 100)) if total_sessions_all > 0 else 0

        # Flux des activités récentes
        recent_activities = []
        for p in SessionProgress.objects.filter(user=user).select_related('session', 'ue').order_by('-last_accessed_at')[:5]:
            recent_activities.append({
                'type': 'session',
                'date': (p.completed_at or p.last_accessed_at).isoformat(),
                'title': p.session.title if p.session else 'Séance de cours',
                'subtitle': f"{p.ue.code if p.ue else ''} · {'Séance validée' if p.status == 'completed' else 'En cours de lecture'}",
                'status': p.status
            })

        for a in user_attempts.order_by('-submitted_at')[:5]:
            recent_activities.append({
                'type': 'quiz',
                'date': a.submitted_at.isoformat(),
                'title': f"Questionnaire : {a.session.title if a.session else 'Test'}",
                'subtitle': f"Score : {a.percentage}% · {'Admis' if a.passed else 'À retravailler'}",
                'status': 'completed' if a.passed else 'in_progress'
            })

        recent_activities.sort(key=lambda x: x['date'], reverse=True)
        recent_activities = recent_activities[:8]

        return Response({
            'globalProgress': global_progress,
            'totalSessionsAll': total_sessions_all,
            'totalCompletedAll': total_completed_all,
            'totalQuizzesTaken': user_attempts.count(),
            'ueBreakdown': ue_breakdown,
            'recentActivities': recent_activities
        })


class AdminUESaveView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def post(self, request):
        data = request.data
        ue_id = data.get('id')
        code = data.get('code', '').strip().upper()
        title = data.get('title', '').strip()

        from academic.models import Department, Program
        dept_id = data.get('departmentId')
        prog_id = data.get('programId')

        dept = Department.objects.filter(id=dept_id).first() if dept_id else None
        prog = Program.objects.filter(id=prog_id).first() if prog_id else None

        if ue_id:
            try:
                ue = UE.objects.get(id=ue_id)
            except UE.DoesNotExist:
                return Response({'error': 'UE introuvable.'}, status=status.HTTP_404_NOT_FOUND)
            if code: ue.code = code
            if title: ue.title = title
            if 'description' in data: ue.description = data['description']
            if 'objective' in data: ue.objective = data['objective']
            if dept: ue.department = dept
            if prog: ue.program = prog
            if 'level' in data: ue.level = data['level']
            if 'semester' in data: ue.semester = data['semester']
            if 'academicYear' in data: ue.academic_year = data['academicYear']
            if 'priceFcfa' in data: ue.price_fcfa = int(data['priceFcfa'])
            if 'isPublished' in data: ue.is_published = bool(data['isPublished'])
            if 'isSuspended' in data: ue.is_suspended = bool(data['isSuspended'])
            ue.save()
        else:
            ue = UE.objects.create(
                code=code or 'NOUV-101',
                title=title or "Nouvelle Unité d'Enseignement",
                description=data.get('description', ''),
                objective=data.get('objective', "Objectif pédagogique général de l'UE."),
                department=dept,
                program=prog,
                level=data.get('level', 'L1'),
                semester=data.get('semester', 'Semestre 1'),
                academic_year=data.get('academicYear', '2025-2026'),
                is_published=bool(data.get('isPublished', True)),
                is_suspended=bool(data.get('isSuspended', False)),
                price_fcfa=int(data.get('priceFcfa', 500)),
                order=UE.objects.count() + 1
            )

        return Response({'success': True, 'ue': UESerializer(ue, context={'request': request}).data})


class AdminUESuspendView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def put(self, request, ue_id):
        try:
            ue = UE.objects.get(id=ue_id)
        except UE.DoesNotExist:
            return Response({'error': 'UE introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        ue.is_suspended = not ue.is_suspended
        ue.save()
        return Response({'success': True, 'isSuspended': ue.is_suspended})


class AdminUEDeleteView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def delete(self, request, ue_id):
        try:
            ue = UE.objects.get(id=ue_id)
        except UE.DoesNotExist:
            return Response({'error': 'UE introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        ue.delete()
        return Response({'success': True})


class AdminSessionSaveView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def post(self, request):
        data = request.data
        session_id = data.get('id')
        ue_id = data.get('ueId')

        if session_id:
            try:
                session = Session.objects.get(id=session_id)
            except Session.DoesNotExist:
                return Response({'error': 'Séance introuvable.'}, status=status.HTTP_404_NOT_FOUND)
            if 'title' in data: session.title = data['title']
            if 'description' in data: session.description = data['description']
            if 'objective' in data: session.objective = data['objective']
            if 'sessionNumber' in data: session.session_number = int(data['sessionNumber'])
            if 'estimatedMinutes' in data: session.estimated_minutes = int(data['estimatedMinutes'])
            if 'isPublished' in data: session.is_published = bool(data['isPublished'])
            if 'isSuspended' in data: session.is_suspended = bool(data['isSuspended'])
            if 'summaryText' in data: session.summary_text = data['summaryText']
            if 'video' in data: session.video = data['video']
            if 'audio' in data: session.audio = data['audio']
            if 'pdf' in data: session.pdf = data['pdf']
            if 'flashcards' in data: session.flashcards = data['flashcards']
            session.save()
        else:
            try:
                ue = UE.objects.get(id=ue_id)
            except UE.DoesNotExist:
                return Response({'error': 'UE parente introuvable.'}, status=status.HTTP_404_NOT_FOUND)

            sess_num = int(data.get('sessionNumber', 1))
            session = Session.objects.create(
                ue=ue,
                session_number=sess_num,
                title=data.get('title', 'Nouvelle séance'),
                description=data.get('description', ''),
                objective=data.get('objective', 'Objectif pédagogique de la séance.'),
                estimated_minutes=int(data.get('estimatedMinutes', 45)),
                order=sess_num,
                is_published=bool(data.get('isPublished', True)),
                is_suspended=bool(data.get('isSuspended', False)),
                summary_text=data.get('summaryText', "Contenu pédagogique en cours de rédaction par l'équipe enseignante."),
                video=data.get('video') or {},
                audio=data.get('audio') or {},
                pdf=data.get('pdf') or {},
                flashcards=data.get('flashcards') or []
            )

        return Response({'success': True, 'session': SessionSerializer(session, context={'request': request}).data})


class AdminSessionSuspendView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def put(self, request, session_id):
        try:
            session = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            return Response({'error': 'Séance introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        session.is_suspended = not session.is_suspended
        session.save()
        return Response({'success': True, 'isSuspended': session.is_suspended})


class AdminSessionToggleAccessView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def put(self, request, session_id):
        try:
            session = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            return Response({'error': 'Séance introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if session.session_number == 1:
            return Response({
                'error': 'La 1ère séance de chaque UE est obligatoirement gratuite et accessible à tous les étudiants inscrits (non verrouillable).'
            }, status=status.HTTP_400_BAD_REQUEST)

        is_locked_input = request.data.get('isLocked')
        if is_locked_input is not None:
            session.is_locked_for_users = bool(is_locked_input)
        else:
            current = session.is_locked_for_users if session.is_locked_for_users is not None else True
            session.is_locked_for_users = not current

        session.save()
        return Response({
            'success': True,
            'isLockedForUsers': session.is_locked_for_users,
            'message': f"Séance {session.session_number} {'bloquée pour les comptes simples non autorisés.' if session.is_locked_for_users else 'désormais accessible gratuitement pour tous les étudiants.'}"
        })


class AdminSessionDeleteView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def delete(self, request, session_id):
        try:
            session = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            return Response({'error': 'Séance introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        session.delete()
        return Response({'success': True})
