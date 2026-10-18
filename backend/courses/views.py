from django.utils import timezone
from datetime import timedelta
from django.db.models import Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import UE, Session, Chapter, Quiz, QuizQuestion, UserUEAccess, SessionProgress, QuizAttempt, UEReview
from .serializers import UESerializer, SessionSerializer, ChapterSerializer, QuizAttemptSerializer, UEReviewSerializer
from accounts.permissions import IsStaffOrSuperuser
from notifications.utils import notify_quiz_passed
from audit.trash_service import (
    move_to_trash_ue,
    move_to_trash_session,
    move_to_trash_chapter,
)

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

        # ⭐ Notification si quiz réussi
        if attempt.passed:
            try:
                ue_code = attempt.ue.code if hasattr(attempt, 'ue') and attempt.ue else None
                notify_quiz_passed(
                    user=request.user,
                    quiz_title=attempt.quiz.title if hasattr(attempt, 'quiz') and attempt.quiz else 'Quiz',
                    score_percent=attempt.percentage,
                    ue_code=ue_code,
                )
            except Exception as e:
                print(f"[courses] Erreur notif quiz : {e}")

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
        # Récupérer le délai de rétention configuré par l'admin
        try:
            from monetization.models import PlatformConfig
            config = PlatformConfig.get_solo()
            retention_days = config.activities_retention_days or 30
        except Exception:
            retention_days = 30

        cutoff_date = timezone.now() - timedelta(days=retention_days)
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
        # Compter les récompenses de parrainage disponibles
        try:
            from referrals.models import ReferralReward
            available_rewards_count = ReferralReward.objects.filter(
                user=user,
                is_used=False,
            ).exclude(
                # Exclure les sponsorisations déjà activées
                reward_type='sponsored_1m',
                is_activated=True,
            ).count()
        except Exception:
            available_rewards_count = 0

        # Flux des activités récentes (⭐ filtré par le délai configuré)
        recent_activities = []

        # 1. Activités de type séance
        for p in SessionProgress.objects.filter(
            user=user,
            last_accessed_at__gte=cutoff_date
        ).select_related('session', 'ue').order_by('-last_accessed_at')[:5]:
            recent_activities.append({
                'type': 'session',
                'date': (p.completed_at or p.last_accessed_at).isoformat(),
                'title': p.session.title if p.session else 'Séance de cours',
                'subtitle': f"{p.ue.code if p.ue else ''} · {'Séance validée' if p.status == 'completed' else 'En cours de lecture'}",
                'status': p.status
            })

        # 2. Activités de type quiz
        for a in user_attempts.filter(submitted_at__gte=cutoff_date).order_by('-submitted_at')[:5]:
            recent_activities.append({
                'type': 'quiz',
                'date': a.submitted_at.isoformat(),
                'title': f"Questionnaire : {a.session.title if a.session else 'Test'}",
                'subtitle': f"Score : {a.percentage}% · {'Admis' if a.passed else 'À retravailler'}",
                'status': 'completed' if a.passed else 'in_progress'
            })

        # Trier par date décroissante et limiter à 8
        recent_activities.sort(key=lambda x: x['date'], reverse=True)
        recent_activities = recent_activities[:8]

        return Response({
            'globalProgress': global_progress,
            'totalSessionsAll': total_sessions_all,
            'totalCompletedAll': total_completed_all,
            'totalQuizzesTaken': user_attempts.count(),
            'ueBreakdown': ue_breakdown,
            'recentActivities': recent_activities,
            'availableRewardsCount': available_rewards_count,   # ⭐ NOUVEAU
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

        # ⭐ Déplacement vers la corbeille au lieu de suppression directe
        try:
            entry = move_to_trash_ue(ue, deleted_by=request.user)

            try:
                from audit.utils import log_audit
                log_audit(
                    action='UE_DELETE',
                    resource=ue_id,
                    details=f"UE « {entry.display_name} » déplacée vers la corbeille",
                    user=request.user,
                    ip=request.META.get('REMOTE_ADDR')
                )
            except Exception:
                pass

            return Response({
                'success': True,
                'message': "UE déplacée vers la corbeille. Elle sera récupérable pendant 30 jours.",
                'trashId': entry.id,
            })
        except Exception as e:
            return Response(
                {'error': f"Erreur lors de la suppression : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
        import logging
        logging.getLogger(__name__).error(f"CHAPTER SAVE ERROR: {request.data}")
        print(f"\n\n=== CHAPTER SAVE DEBUG ===")
        print(f"Data reçue: {dict(request.data)}")
        print(f"==========================\n\n")
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

            # Récupérer les styles de blocs (peut être un dict JSON)
            blocks_style_data = data.get('summaryBlocksStyle')
            if not isinstance(blocks_style_data, dict):
                blocks_style_data = {}

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
                chapter.summary_html = str(data.get('summaryHtml') or '').strip()
                if isinstance(data.get('summaryJson'), dict):
                    chapter.summary_json = data.get('summaryJson')
                chapter.summary_blocks_style = blocks_style_data  # ⭐ NOUVEAU
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
                    summary_html=str(data.get('summaryHtml') or '').strip(),
                    summary_json=data.get('summaryJson') if isinstance(data.get('summaryJson'), dict) else {},
                    summary_blocks_style=blocks_style_data,
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
            import traceback
            traceback.print_exc()
            return Response({'error': f"Erreur lors de l'enregistrement du chapitre: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class AdminChapterDeleteView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def delete(self, request, chapter_id):
        try:
            chapter = Chapter.objects.get(id=chapter_id)
        except Chapter.DoesNotExist:
            return Response({'error': 'Chapitre introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        # ⭐ Déplacement vers la corbeille
        try:
            entry = move_to_trash_chapter(chapter, deleted_by=request.user)

            try:
                from audit.utils import log_audit
                log_audit(
                    action='CHAPTER_DELETE',
                    resource=chapter_id,
                    details=f"Chapitre « {entry.display_name} » déplacé vers la corbeille",
                    user=request.user,
                    ip=request.META.get('REMOTE_ADDR')
                )
            except Exception:
                pass

            return Response({
                'success': True,
                'message': "Chapitre déplacé vers la corbeille. Il sera récupérable pendant 30 jours.",
                'trashId': entry.id,
            })
        except Exception as e:
            return Response(
                {'error': f"Erreur lors de la suppression : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

        # ⭐ Déplacement vers la corbeille
        try:
            entry = move_to_trash_session(session, deleted_by=request.user)

            try:
                from audit.utils import log_audit
                log_audit(
                    action='SESSION_DELETE',
                    resource=session_id,
                    details=f"Séance « {entry.display_name} » déplacée vers la corbeille",
                    user=request.user,
                    ip=request.META.get('REMOTE_ADDR')
                )
            except Exception:
                pass

            return Response({
                'success': True,
                'message': "Séance déplacée vers la corbeille. Elle sera récupérable pendant 30 jours.",
                'trashId': entry.id,
            })
        except Exception as e:
            return Response(
                {'error': f"Erreur lors de la suppression : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
# =============================================================================
# AVIS SUR UE (UEReview)
# =============================================================================

class UEReviewsListView(APIView):
    """Liste publique des avis visibles pour une UE."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, ue_id):
        try:
            ue = UE.objects.get(id=ue_id)
        except UE.DoesNotExist:
            return Response({'error': 'UE introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        reviews = UEReview.objects.filter(ue=ue, is_visible=True).select_related('user').order_by('-created_at')

        # Stats agrégées
        from django.db.models import Avg, Count
        stats = reviews.aggregate(avg=Avg('rating'), count=Count('id'))

        # Distribution des notes (1-5)
        distribution = {str(i): 0 for i in range(1, 6)}
        for r in reviews:
            distribution[str(r.rating)] = distribution.get(str(r.rating), 0) + 1

        serializer = UEReviewSerializer(reviews, many=True)

        # Vérifier si l'user connecté peut laisser un avis
        can_review = False
        has_reviewed = False
        my_review_id = None

        if request.user and request.user.is_authenticated:
            from .models import SessionProgress
            # Vérifier que l'user a complété 100% de l'UE
            total_sessions = ue.sessions.filter(is_published=True, is_suspended=False).count()
            if total_sessions > 0:
                completed = SessionProgress.objects.filter(
                    user=request.user,
                    ue=ue,
                    status='completed'
                ).count()
                can_review = completed >= total_sessions

            # Vérifier s'il a déjà laissé un avis
            existing = UEReview.objects.filter(user=request.user, ue=ue).first()
            if existing:
                has_reviewed = True
                my_review_id = existing.id
                # S'il a déjà un avis mais caché, on le laisse modifier
                if not existing.is_visible:
                    can_review = True

        return Response({
            'reviews': serializer.data,
            'stats': {
                'averageRating': round(stats['avg'], 2) if stats['avg'] else None,
                'totalReviews': stats['count'] or 0,
                'distribution': distribution,
            },
            'canReview': can_review,
            'hasReviewed': has_reviewed,
            'myReviewId': my_review_id,
        })


class UEReviewSubmitView(APIView):
    """Soumet ou met à jour un avis sur une UE. Restriction : 100% de l'UE terminée."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ue_id):
        user = request.user

        try:
            ue = UE.objects.get(id=ue_id)
        except UE.DoesNotExist:
            return Response({'error': 'UE introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        # ⭐ Vérification CRITIQUE : l'étudiant doit avoir terminé 100% de l'UE
        from .models import SessionProgress
        total_sessions = ue.sessions.filter(is_published=True, is_suspended=False).count()
        if total_sessions == 0:
            return Response({
                'error': "Cette UE n'a pas encore de séances publiées."
            }, status=status.HTTP_400_BAD_REQUEST)

        completed = SessionProgress.objects.filter(
            user=user,
            ue=ue,
            status='completed'
        ).count()

        if completed < total_sessions:
            return Response({
                'error': f"Vous devez terminer toutes les séances de l'UE avant de laisser un avis. Progression : {completed}/{total_sessions}."
            }, status=status.HTTP_403_FORBIDDEN)

        rating = request.data.get('rating')
        comment = str(request.data.get('comment', '')).strip()

        # Validation
        try:
            rating = int(rating)
        except (ValueError, TypeError):
            return Response({'error': 'Note invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        if rating < 1 or rating > 5:
            return Response({'error': 'La note doit être entre 1 et 5.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(comment) > 2000:
            return Response({'error': 'Le commentaire est trop long (max 2000 caractères).'}, status=status.HTTP_400_BAD_REQUEST)

        # Créer ou mettre à jour l'avis
        review, created = UEReview.objects.update_or_create(
            user=user,
            ue=ue,
            defaults={
                'rating': rating,
                'comment': comment,
                'is_visible': True,  # Réafficher si modifié
                'moderation_reason': '',  # Reset motif
            }
        )

        try:
            from audit.utils import log_audit
            log_audit(
                action='UE_REVIEW_SUBMIT',
                resource=ue.id,
                details=f"{'Nouvel avis' if created else 'Modification avis'} sur {ue.code} : {rating}/5",
                user=user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({
            'success': True,
            'review': UEReviewSerializer(review).data,
            'isNew': created,
        })


class UEReviewDeleteView(APIView):
    """Supprime son propre avis sur une UE."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, review_id):
        try:
            review = UEReview.objects.get(id=review_id)
        except UEReview.DoesNotExist:
            return Response({'error': 'Avis introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if review.user_id != request.user.id:
            return Response({'error': 'Vous ne pouvez supprimer que votre propre avis.'}, status=status.HTTP_403_FORBIDDEN)

        review.delete()
        return Response({'success': True})


# =============================================================================
# MODÉRATION DES AVIS (Admin)
# =============================================================================

class AdminUEReviewsListView(APIView):
    """Liste tous les avis pour modération."""
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        qs = UEReview.objects.all().select_related('user', 'ue').order_by('-created_at')

        # Filtres
        ue_filter = request.GET.get('ueId')
        if ue_filter:
            qs = qs.filter(ue_id=ue_filter)

        visibility = request.GET.get('visibility')
        if visibility == 'visible':
            qs = qs.filter(is_visible=True)
        elif visibility == 'hidden':
            qs = qs.filter(is_visible=False)

        search = request.GET.get('q', '').strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(user__phone__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(comment__icontains=search) |
                Q(ue__code__icontains=search)
            )

        serializer = UEReviewSerializer(qs[:500], many=True)
        return Response({
            'reviews': serializer.data,
            'total': qs.count(),
        })


class AdminUEReviewToggleVisibilityView(APIView):
    """Masque ou réaffiche un avis."""
    permission_classes = [IsStaffOrSuperuser]

    def put(self, request, review_id):
        try:
            review = UEReview.objects.get(id=review_id)
        except UEReview.DoesNotExist:
            return Response({'error': 'Avis introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        review.is_visible = not review.is_visible
        review.moderation_reason = str(request.data.get('reason', '')).strip() if not review.is_visible else ''
        review.save()

        return Response({
            'success': True,
            'isVisible': review.is_visible,
        })


class AdminUEReviewDeleteView(APIView):
    """Supprime un avis (admin)."""
    permission_classes = [IsStaffOrSuperuser]

    def delete(self, request, review_id):
        try:
            review = UEReview.objects.get(id=review_id)
        except UEReview.DoesNotExist:
            return Response({'error': 'Avis introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        review.delete()
        return Response({'success': True})

# =============================================================================
# UPLOAD CLOUDINARY
# =============================================================================

class CloudinarySignatureView(APIView):
    """
    Génère une signature pour upload direct depuis le frontend.
    Sécurisé : seul le STAFF/SUPERUSER avec permission 'courses' peut uploader.
    """
    permission_classes = [IsStaffOrSuperuser]

    def post(self, request):
        from .cloudinary_service import generate_upload_signature, is_cloudinary_configured

        if not is_cloudinary_configured():
            return Response({
                'error': "Cloudinary n'est pas configuré sur le serveur. Vérifiez les variables d'environnement."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        resource_type = request.data.get('resourceType', 'video')
        if resource_type not in ('video', 'image', 'raw'):
            resource_type = 'video'

        folder = request.data.get('folder', 'ulstudyflow/chapters')

        try:
            signature_data = generate_upload_signature(
                resource_type=resource_type,
                folder=folder,
            )
            return Response(signature_data)
        except Exception as e:
            return Response(
                {'error': f"Erreur signature : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CloudinaryUploadView(APIView):
    """
    Upload direct côté serveur (fallback si le front ne peut pas uploader directement).
    Reçoit un fichier en multipart/form-data.
    """
    permission_classes = [IsStaffOrSuperuser]

    def post(self, request):
        from .cloudinary_service import upload_media, is_cloudinary_configured

        if not is_cloudinary_configured():
            return Response({
                'error': "Cloudinary n'est pas configuré sur le serveur."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {'error': 'Aucun fichier fourni.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        resource_type = request.data.get('resourceType', 'video')
        folder = request.data.get('folder', 'ulstudyflow/chapters')
        tags = request.data.getlist('tags') if hasattr(request.data, 'getlist') else None

        result = upload_media(
            file_obj=file_obj,
            resource_type=resource_type,
            folder=folder,
            tags=tags,
        )

        if not result.get('success'):
            return Response(
                {'error': result.get('error', 'Erreur upload')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            from audit.utils import log_audit
            log_audit(
                action='CLOUDINARY_UPLOAD',
                resource=result.get('public_id', ''),
                details=f"Upload {resource_type} ({result.get('bytes', 0)} bytes)",
                user=request.user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response(result)


class SecureVideoURLView(APIView):
    """
    Génère une URL signée + watermark pour le média d'un chapitre.
    Vérifie que l'étudiant a bien accès à l'UE avant de générer.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, chapter_id):
        from .cloudinary_service import (
            build_secure_video_url,
            build_watermarked_audio_url,
            build_watermarked_pdf_url,
            is_cloudinary_configured,
        )
        from .models import SessionProgress  # ⭐ pour vérifier accès

        try:
            chapter = Chapter.objects.select_related('session', 'session__ue').get(id=chapter_id)
        except Chapter.DoesNotExist:
            return Response({'error': 'Chapitre introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        ue = chapter.session.ue

        # ⭐ VÉRIFICATION D'ACCÈS : staff, sponsorisé, 1ère séance, ou UE débloquée
        from .models import UserUEAccess
        is_staff = user.role in ('SUPERUSER', 'STAFF') or user.is_staff or user.is_superuser
        is_sponsored = bool(getattr(user, 'is_sponsored', False))
        is_first_session = chapter.session.session_number == 1

        has_access = False
        if is_staff or is_sponsored or is_first_session:
            has_access = True
        else:
            access = UserUEAccess.objects.filter(
                user=user, ue=ue, status='active'
            ).first()
            if access and not access.is_expired:
                has_access = True

        if not has_access:
            return Response(
                {'error': "Vous n'avez pas accès à ce contenu. Faites une demande de déblocage."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not is_cloudinary_configured():
            return Response(
                {'error': "Cloudinary non configuré."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # ⭐ Récupérer les infos média du chapitre
        video_data = chapter.video or {}
        audio_data = chapter.audio or {}
        pdf_data = chapter.pdf or {}

        result = {}

        # Vidéo (prioritaire)
        if video_data.get('public_id'):
            secure_url = build_secure_video_url(video_data['public_id'], user)
            if secure_url:
                result['videoUrl'] = secure_url
                result['videoWatermarked'] = True

        # Audio
        if audio_data.get('public_id'):
            audio_url = build_watermarked_audio_url(audio_data['public_id'], user)
            if audio_url:
                result['audioUrl'] = audio_url

        # PDF
        if pdf_data.get('public_id'):
            pdf_url = build_watermarked_pdf_url(pdf_data['public_id'], user)
            if pdf_url:
                result['pdfUrl'] = pdf_url

        if not result:
            return Response(
                {'error': "Aucun média Cloudinary disponible pour ce chapitre."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Métadonnées
        result['expiresIn'] = 7200  # 2h
        result['watermarkText'] = f"{user.first_name} {user.last_name} · {getattr(user, 'display_phone', user.phone)}"

        return Response(result)

def _extract_cloudinary_public_id(url):
    """
    Extrait le public_id d'une URL Cloudinary.
    Gère les formats : /upload/, /authenticated/, /private/
    """
    if not url or 'cloudinary.com' not in url:
        return None

    try:
        # Retirer les query params (?v=xxx)
        url_clean = url.split('?')[0]

        # Chercher le marqueur de type de delivery
        for marker in ['/authenticated/', '/upload/', '/private/']:
            if marker in url_clean:
                path = url_clean.split(marker, 1)[1]
                break
        else:
            return None

        # Retirer le préfixe de version (v1234/)
        if path.startswith('v') and '/' in path:
            # Vérifier que c'est bien une version (v + chiffres)
            first_segment = path.split('/', 1)[0]
            if first_segment[1:].isdigit():
                path = path.split('/', 1)[1]

        # Retirer l'extension
        public_id = path.rsplit('.', 1)[0]
        return public_id
    except Exception:
        return None
