from django.utils import timezone
from django.db.models import Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import UE, Session, Chapter, Quiz, QuizQuestion, UserUEAccess, SessionProgress, QuizAttempt
from .serializers import UESerializer, SessionSerializer, ChapterSerializer, QuizAttemptSerializer
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
            now = timezone.now()
            from django.db.models import Q
            access_ue_ids = UserUEAccess.objects.filter(
                user=user,
                status='active'
            ).filter(
                Q(expires_at__isnull=True) | Q(expires_at__gt=now)
            ).values_list('ue_id', flat=True)
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

        sessions = ue.sessions.filter(is_published=True, is_suspended=False).prefetch_related('chapters', 'chapters__quiz__questions', 'quiz__questions').order_by('order', 'session_number')

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
            session = Session.objects.select_related('ue').prefetch_related('chapters', 'chapters__quiz__questions', 'quiz__questions').get(id=session_id)
        except Session.DoesNotExist:
            return Response({'error': 'Séance non trouvée.'}, status=status.HTTP_404_NOT_FOUND)

        ue = session.ue

        # Règles d'accès pédagogiques UL Study Flow :
        # 1. La séance 1 de chaque UE est TOUJOURS gratuite et accessible à tous les étudiants inscrits !
        # 2. Les séances suivantes (> 1) nécessitent un accès accordé actif et non-expiré ou le statut staff/sponsorisé.
        is_first_session = (session.session_number == 1)
        is_staff_or_super = user.role in ('SUPERUSER', 'STAFF') or user.is_superuser or user.is_staff
        is_sponsored = bool(user.is_sponsored)
        
        access = UserUEAccess.objects.filter(user=user, ue=ue, status='active').first()
        has_ue_access = bool(access and not access.is_expired)
        is_expired_access = bool(access and access.is_expired)
        
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
            if is_expired_access and access and access.expires_at:
                exp_date_str = access.expires_at.strftime('%d/%m/%Y')
                error_msg = f"Votre accès débloqué à l'UE '{ue.code}' a expiré le {exp_date_str} (durée de validité de 6 mois et 10 jours écoulée). Veuillez soumettre une nouvelle demande de déblocage pour réactiver vos séances."
            else:
                error_msg = 'Cette séance est bloquée pour votre compte étudiant. Seule la 1ère séance de chaque UE est gratuite et accessible. Pour débloquer les autres séances, faites une demande de déblocage.'

            return Response({
                'error': error_msg,
                'isLocked': True,
                'isExpired': is_expired_access,
                'expiresAt': access.expires_at.isoformat() if access and access.expires_at else None,
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
            quiz = Quiz.objects.select_related('session', 'session__ue', 'chapter', 'chapter__session', 'chapter__session__ue').prefetch_related('questions').get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({'error': 'Questionnaire introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        session = quiz.session or (quiz.chapter.session if quiz.chapter else None)
        ue = session.ue if session else (quiz.chapter.session.ue if quiz.chapter else None)

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
            session=session,
            ue=ue,
            score=total_score,
            max_score=max_score,
            percentage=percentage,
            passed=passed,
            user_answers=answers,
            submitted_at=timezone.now()
        )

        # Si le quiz est réussi et lié à une séance, marquer la séance comme complétée
        if passed and session:
            progress, _ = SessionProgress.objects.get_or_create(
                user=user,
                session=session,
                defaults={'ue': ue, 'status': 'completed', 'completed_at': timezone.now()}
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
            if 'order' in data: session.order = int(data['order'])
            if 'isPublished' in data: session.is_published = bool(data['isPublished'])
            if 'isSuspended' in data: session.is_suspended = bool(data['isSuspended'])
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
                is_suspended=bool(data.get('isSuspended', False))
            )

        return Response({'success': True, 'session': SessionSerializer(session, context={'request': request}).data})


class AdminChapterSaveView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def post(self, request):
        try:
            data = request.data
            chapter_id = data.get('id')
            session_id = data.get('sessionId') or data.get('session')
            ue_id = data.get('ueId')

            # Clean and validate title
            title = str(data.get('title') or '').strip()
            if not title:
                title = f"Chapitre {data.get('number', 1)}"

            # Safe number and order parsing
            try:
                chap_number = int(data.get('number', 1))
            except (ValueError, TypeError):
                chap_number = 1

            try:
                chap_order = int(data.get('order', chap_number))
            except (ValueError, TypeError):
                chap_order = chap_number

            summary_text = str(data.get('summaryText') or '').strip()
            objectives = str(data.get('objectives') or '').strip()
            video_data = data.get('video') if isinstance(data.get('video'), dict) else {}
            audio_data = data.get('audio') if isinstance(data.get('audio'), dict) else {}
            pdf_data = data.get('pdf') if isinstance(data.get('pdf'), dict) else {}
            flashcards_data = data.get('flashcards') if isinstance(data.get('flashcards'), list) else []

            if chapter_id:
                try:
                    chapter = Chapter.objects.get(id=chapter_id)
                except Chapter.DoesNotExist:
                    return Response({'error': 'Chapitre introuvable.'}, status=status.HTTP_404_NOT_FOUND)

                chapter.title = title
                chapter.number = chap_number
                chapter.order = chap_order
                chapter.objectives = objectives
                chapter.summary_text = summary_text
                chapter.video = video_data
                chapter.audio = audio_data
                chapter.pdf = pdf_data
                chapter.flashcards = flashcards_data
                chapter.save()
            else:
                session = None
                if session_id:
                    session = Session.objects.filter(id=session_id).first()

                if not session and ue_id:
                    ue = UE.objects.filter(id=ue_id).first()
                    if ue:
                        session = ue.sessions.first()
                        if not session:
                            session = Session.objects.create(
                                ue=ue,
                                session_number=1,
                                title=f"Séance 01 : {ue.title}",
                                description=f"Séance d'introduction de {ue.code}",
                                estimated_minutes=45,
                                order=1
                            )

                if not session:
                    return Response({'error': 'Veuillez spécifier la séance parente pour ce chapitre.'}, status=status.HTTP_400_BAD_REQUEST)

                # Si numéro non spécifié ou <= 0, auto-assigner
                if chap_number <= 0:
                    last_ch = session.chapters.order_by('-number').first()
                    chap_number = (last_ch.number + 1) if last_ch else 1
                    chap_order = chap_number

                chapter = Chapter.objects.create(
                    session=session,
                    number=chap_number,
                    title=title,
                    objectives=objectives,
                    order=chap_order,
                    summary_text=summary_text,
                    video=video_data,
                    audio=audio_data,
                    pdf=pdf_data,
                    flashcards=flashcards_data
                )

            # Gérer le quiz associé au chapitre
            quiz_data = data.get('quiz')
            if quiz_data is False or quiz_data is None:
                Quiz.objects.filter(chapter=chapter).delete()
            elif isinstance(quiz_data, dict) and 'questions' in quiz_data:
                q_list = quiz_data.get('questions', [])
                if len(q_list) > 0:
                    try:
                        pass_score = int(quiz_data.get('passingScorePercent') or 75)
                    except (ValueError, TypeError):
                        pass_score = 75

                    quiz, _ = Quiz.objects.update_or_create(
                        chapter=chapter,
                        defaults={
                            'title': quiz_data.get('title') or f"QCM {chapter.title}",
                            'description': quiz_data.get('description', ''),
                            'passing_score_percent': pass_score
                        }
                    )
                    quiz.questions.all().delete()
                    for idx, q in enumerate(q_list, start=1):
                        try:
                            pts = int(q.get('points') or 1)
                        except (ValueError, TypeError):
                            pts = 1

                        QuizQuestion.objects.create(
                            quiz=quiz,
                            text=str(q.get('text', '')).strip(),
                            question_type=q.get('type', 'single'),
                            options=q.get('options', []),
                            correct_answer=q.get('correctAnswer', ''),
                            explanation=str(q.get('explanation', '')).strip(),
                            points=pts,
                            order=idx
                        )
                else:
                    Quiz.objects.filter(chapter=chapter).delete()

            return Response({'success': True, 'chapter': ChapterSerializer(chapter, context={'request': request}).data})

        except Exception as e:
            return Response({'error': f"Erreur lors de l'enregistrement du chapitre: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class AdminChapterDeleteView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def delete(self, request, chapter_id):
        try:
            chapter = Chapter.objects.get(id=chapter_id)
        except Chapter.DoesNotExist:
            return Response({'error': 'Chapitre introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        chapter.delete()
        return Response({'success': True})


class AdminUsersProgressView(APIView):
    """Permet au superuser et au staff autorisé de consulter la progression de tous les étudiants."""
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        from accounts.models import User
        # Filter students
        qs = User.objects.filter(role='USER').order_by('-created_at')

        # Filters
        query = request.GET.get('q', '').strip().lower()
        level_filter = request.GET.get('level', '').strip()
        dept_filter = request.GET.get('department', '').strip()
        program_filter = request.GET.get('program', '').strip()

        if level_filter:
            qs = qs.filter(level=level_filter)
        if dept_filter:
            qs = qs.filter(department__icontains=dept_filter)
        if program_filter:
            qs = qs.filter(program__icontains=program_filter)

        all_ues = list(UE.objects.filter(is_published=True, is_suspended=False).prefetch_related('sessions'))
        ue_map = {ue.id: ue for ue in all_ues}
        all_sessions_count = sum(ue.sessions.count() for ue in all_ues)

        student_progress_list = []
        total_completed_all_students = 0
        total_quizzes_all_students = 0

        for student in qs:
            if query:
                full_text = f"{student.first_name} {student.last_name} {student.phone} {student.display_phone} {student.email or ''}".lower()
                if query not in full_text:
                    continue

            # Check accessible UEs for student
            if student.is_sponsored or student.role in ('SUPERUSER', 'STAFF'):
                student_ues = all_ues
            else:
                user_access_ids = set(UserUEAccess.objects.filter(user=student, status='active').values_list('ue_id', flat=True))
                student_ues = [ue for ue in all_ues if ue.id in user_access_ids]

            # Student session progresses & attempts
            progress_records = list(SessionProgress.objects.filter(user=student).select_related('session', 'ue'))
            completed_records = [p for p in progress_records if p.status == 'completed']
            quiz_attempts = list(QuizAttempt.objects.filter(user=student))

            completed_sessions_count = len(completed_records)
            total_sessions_for_student = sum(ue.sessions.count() for ue in student_ues) if student_ues else all_sessions_count
            
            global_percent = min(100, round((completed_sessions_count / total_sessions_for_student) * 100)) if total_sessions_for_student > 0 else 0
            
            total_quizzes = len(quiz_attempts)
            passed_quizzes = sum(1 for a in quiz_attempts if a.passed)
            avg_score = round(sum(a.percentage for a in quiz_attempts) / total_quizzes) if total_quizzes > 0 else 0

            # Last activity
            last_activity = student.last_login_at
            if progress_records:
                latest_p = max(progress_records, key=lambda p: p.last_accessed_at or student.created_at)
                if not last_activity or (latest_p.last_accessed_at and latest_p.last_accessed_at > last_activity):
                    last_activity = latest_p.last_accessed_at
            if quiz_attempts:
                latest_q = max(quiz_attempts, key=lambda a: a.submitted_at)
                if not last_activity or (latest_q.submitted_at and latest_q.submitted_at > last_activity):
                    last_activity = latest_q.submitted_at

            # UE breakdown for student
            ue_breakdown = []
            for ue in student_ues:
                ue_sess_ids = [s.id for s in ue.sessions.all()]
                ue_total_sess = len(ue_sess_ids)
                ue_completed = sum(1 for p in completed_records if p.session_id in ue_sess_ids)
                ue_pct = min(100, round((ue_completed / ue_total_sess) * 100)) if ue_total_sess > 0 else 0
                ue_atts = [a for a in quiz_attempts if a.ue_id == ue.id]
                ue_avg_score = round(sum(a.percentage for a in ue_atts) / len(ue_atts)) if ue_atts else None

                ue_breakdown.append({
                    'ueId': ue.id,
                    'ueCode': ue.code,
                    'ueTitle': ue.title,
                    'level': ue.level,
                    'totalSessions': ue_total_sess,
                    'completedSessions': ue_completed,
                    'progressPercent': ue_pct,
                    'avgQuizScore': ue_avg_score
                })

            total_completed_all_students += completed_sessions_count
            total_quizzes_all_students += total_quizzes

            student_progress_list.append({
                'id': student.id,
                'phone': student.display_phone or student.phone,
                'rawPhone': student.phone,
                'firstName': student.first_name,
                'lastName': student.last_name,
                'fullName': f"{student.first_name} {student.last_name}",
                'department': student.department,
                'program': student.program,
                'level': student.level,
                'isSponsored': student.is_sponsored,
                'isActive': student.is_active,
                'createdAt': student.created_at.isoformat() if student.created_at else None,
                'lastActivityAt': last_activity.isoformat() if last_activity else None,
                'globalProgressPercent': global_percent,
                'completedSessionsCount': completed_sessions_count,
                'totalSessions': total_sessions_for_student,
                'totalQuizzesTaken': total_quizzes,
                'passedQuizzesCount': passed_quizzes,
                'avgQuizScore': avg_score,
                'accessibleUesCount': len(student_ues),
                'ueBreakdown': ue_breakdown
            })

        avg_completion = round(sum(s['globalProgressPercent'] for s in student_progress_list) / len(student_progress_list)) if student_progress_list else 0

        return Response({
            'students': student_progress_list,
            'summary': {
                'totalStudents': len(student_progress_list),
                'averageCompletionRate': avg_completion,
                'totalCompletedSessions': total_completed_all_students,
                'totalQuizzesTaken': total_quizzes_all_students
            }
        })


class AdminUserDetailProgressView(APIView):
    """Détail approfondi de la progression d'un étudiant particulier."""
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request, user_id):
        from accounts.models import User
        try:
            student = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Étudiant introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        all_ues = list(UE.objects.filter(is_published=True, is_suspended=False).prefetch_related('sessions__chapters'))
        
        if student.is_sponsored or student.role in ('SUPERUSER', 'STAFF'):
            student_ues = all_ues
        else:
            user_access_ids = set(UserUEAccess.objects.filter(user=student, status='active').values_list('ue_id', flat=True))
            student_ues = [ue for ue in all_ues if ue.id in user_access_ids]

        progress_records = {p.session_id: p for p in SessionProgress.objects.filter(user=student)}
        quiz_attempts = list(QuizAttempt.objects.filter(user=student).order_by('-submitted_at'))

        detailed_ues = []
        for ue in student_ues:
            sessions_info = []
            for sess in ue.sessions.all():
                prog = progress_records.get(sess.id)
                sess_attempts = [a for a in quiz_attempts if a.session_id == sess.id]
                sessions_info.append({
                    'sessionId': sess.id,
                    'sessionNumber': sess.session_number,
                    'title': sess.title,
                    'status': prog.status if prog else 'not_started',
                    'lastAccessedAt': prog.last_accessed_at.isoformat() if prog and prog.last_accessed_at else None,
                    'completedAt': prog.completed_at.isoformat() if prog and prog.completed_at else None,
                    'quizAttemptsCount': len(sess_attempts),
                    'bestScore': max((a.percentage for a in sess_attempts), default=None)
                })

            detailed_ues.append({
                'ueId': ue.id,
                'ueCode': ue.code,
                'ueTitle': ue.title,
                'level': ue.level,
                'sessions': sessions_info
            })

        return Response({
            'student': {
                'id': student.id,
                'fullName': f"{student.first_name} {student.last_name}",
                'phone': student.display_phone or student.phone,
                'level': student.level,
                'department': student.department,
                'program': student.program
            },
            'ues': detailed_ues,
            'recentAttempts': QuizAttemptSerializer(quiz_attempts[:10], many=True).data
        })


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
