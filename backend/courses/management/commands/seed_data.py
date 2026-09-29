import json
from pathlib import Path
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from accounts.models import User
from academic.models import Department, Program, AcademicYear
from courses.models import UE, Session, Quiz, QuizQuestion, UserUEAccess, SessionProgress, QuizAttempt
from forms_builder.models import DynamicForm, FormSubmission
from monetization.models import PromoCode, UnlockRequest, PlatformConfig
from audit.models import AuditLog
from notifications.models import Notification, NotificationRecipientStatus

class Command(BaseCommand):
    help = "Charge les données initiales du projet depuis data/database.json dans la base de données Django."

    def handle(self, *args, **options):
        base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
        json_path = base_dir / 'data' / 'database.json'

        if not json_path.exists():
            self.stdout.write(self.style.ERROR(f"Fichier introuvable : {json_path}"))
            return

        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        self.stdout.write(self.style.SUCCESS("Début du chargement des données..."))

        # 1. Platform Config
        cfg_data = data.get('config', {})
        if cfg_data:
            config = PlatformConfig.get_solo()
            config.default_ue_price_fcfa = cfg_data.get('defaultUePriceFcfa', 500)
            config.discounted_ue_price_fcfa = cfg_data.get('discountedUePriceFcfa', 300)
            config.online_assistance_per_hour_fcfa = cfg_data.get('onlineAssistancePerHourFcfa', 1000)
            config.in_person_assistance_per_hour_fcfa = cfg_data.get('inPersonAssistancePerHourFcfa', 2000)
            config.first_chapter_free_enabled = cfg_data.get('firstChapterFreeEnabled', True)
            config.allow_self_registration = cfg_data.get('allowSelfRegistration', True)
            config.university_name = cfg_data.get('universityName', 'UL Study Flow (EdTech par les étudiants)')
            config.academic_year_current = cfg_data.get('academicYearCurrent', '2025-2026')
            config.contact_phones = cfg_data.get('contactPhones', ['+228 99 70 59 20', '+228 71 67 69 45'])
            config.contact_email = cfg_data.get('contactEmail', 'ulstudyflow@gmail.com')
            config.save()
            self.stdout.write(f"- Configuration mise à jour ({config.university_name})")

        # 2. Departments
        for d in data.get('departments', []):
            Department.objects.update_or_create(
                id=d['id'],
                defaults={
                    'code': d['code'],
                    'name': d['name'],
                    'faculty': d.get('faculty', 'Université de Lomé'),
                    'description': d.get('description', ''),
                    'is_suspended': d.get('isSuspended', False)
                }
            )
        self.stdout.write(f"- {len(data.get('departments', []))} départements importés")

        # 3. Programs
        for p in data.get('programs', []):
            dept = Department.objects.filter(id=p.get('departmentId')).first()
            if dept:
                Program.objects.update_or_create(
                    id=p['id'],
                    defaults={
                        'department': dept,
                        'code': p['code'],
                        'name': p['name'],
                        'description': p.get('description', ''),
                        'is_suspended': p.get('isSuspended', False)
                    }
                )
        self.stdout.write(f"- {len(data.get('programs', []))} filières importées")

        # 4. Academic Years
        for ay in data.get('academicYears', []):
            AcademicYear.objects.update_or_create(
                id=ay['id'],
                defaults={
                    'label': ay['label'],
                    'is_current': ay.get('isCurrent', False),
                    'is_archived': ay.get('isArchived', False)
                }
            )
        self.stdout.write(f"- {len(data.get('academicYears', []))} années académiques importées")

        # 5. Users
        for u in data.get('users', []):
            created_at = parse_datetime(u.get('createdAt')) if u.get('createdAt') else timezone.now()
            last_login = parse_datetime(u.get('lastLoginAt')) if u.get('lastLoginAt') else None

            role = u.get('role', 'USER')
            is_super = (role == 'SUPERUSER')
            is_stf = (role in ('STAFF', 'SUPERUSER'))

            user, created = User.objects.update_or_create(
                id=u['id'],
                defaults={
                    'phone': u['phone'],
                    'display_phone': u.get('displayPhone', u['phone']),
                    'email': u.get('email'),
                    'first_name': u.get('firstName', ''),
                    'last_name': u.get('lastName', ''),
                    'department': u.get('department', 'FASEG'),
                    'program': u.get('program', 'Sciences Économiques'),
                    'level': u.get('level', 'L1'),
                    'role': role,
                    'is_active': u.get('isActive', True),
                    'is_staff': is_stf,
                    'is_superuser': is_super,
                    'is_sponsored': u.get('isSponsored', False),
                    'is_ai_suspended': u.get('isAiSuspended', False),
                    'password_hash': u.get('passwordHash'),
                    'password_salt': u.get('passwordSalt'),
                    'created_at': created_at,
                    'last_login_at': last_login
                }
            )
            # Pour le superuser principal, définir également le mot de passe standard s'il correspond
            if u.get('phone') == '+22899705920' or u['id'] == 'usr_super_1':
                user.set_password('Comprendre-apprendre-progresser2026')
                user.save()

        self.stdout.write(f"- {len(data.get('users', []))} utilisateurs importés")

        # 6. UEs
        for ue_data in data.get('ues', []):
            dept = Department.objects.filter(id=ue_data.get('departmentId')).first()
            prog = Program.objects.filter(id=ue_data.get('programId')).first()
            UE.objects.update_or_create(
                id=ue_data['id'],
                defaults={
                    'code': ue_data['code'],
                    'title': ue_data['title'],
                    'description': ue_data.get('description', ''),
                    'objective': ue_data.get('objective', "Objectif pédagogique général de l'UE."),
                    'department': dept,
                    'program': prog,
                    'level': ue_data.get('level', 'L1'),
                    'semester': ue_data.get('semester', 'Semestre 1'),
                    'academic_year': ue_data.get('academicYear', '2025-2026'),
                    'is_published': ue_data.get('isPublished', True),
                    'is_suspended': ue_data.get('isSuspended', False),
                    'price_fcfa': ue_data.get('priceFcfa', 500),
                    'order': ue_data.get('order', 1),
                    'image_url': ue_data.get('imageUrl'),
                    'coefficient': ue_data.get('coefficient', 2),
                    'credit_ects': ue_data.get('creditEcts', 4)
                }
            )
        self.stdout.write(f"- {len(data.get('ues', []))} UEs importées")

        # 7. Sessions & Quizzes
        sess_count = 0
        quiz_count = 0
        for s in data.get('sessions', []):
            ue = UE.objects.filter(id=s.get('ueId')).first()
            if not ue:
                continue

            content = s.get('content', {})
            session, _ = Session.objects.update_or_create(
                id=s['id'],
                defaults={
                    'ue': ue,
                    'session_number': s.get('sessionNumber', 1),
                    'title': s.get('title', 'Séance'),
                    'description': s.get('description', ''),
                    'objective': s.get('objective', "Objectif pédagogique de la séance."),
                    'estimated_minutes': s.get('estimatedMinutes', 45),
                    'order': s.get('order', 1),
                    'is_published': s.get('isPublished', True),
                    'is_suspended': s.get('isSuspended', False),
                    'is_locked_for_users': s.get('isLockedForUsers'),
                    'summary_text': content.get('summaryText', ''),
                    'video': content.get('video') or {},
                    'audio': content.get('audio') or {},
                    'pdf': content.get('pdf') or {},
                    'flashcards': s.get('flashcards') or []
                }
            )
            sess_count += 1

            # Quiz
            q_data = s.get('quiz')
            if q_data:
                quiz, _ = Quiz.objects.update_or_create(
                    id=q_data['id'],
                    defaults={
                        'session': session,
                        'title': q_data.get('title', f"Quiz {session.title}"),
                        'description': q_data.get('description', ''),
                        'passing_score_percent': q_data.get('passingScorePercent', 75)
                    }
                )
                quiz_count += 1

                for idx, q in enumerate(q_data.get('questions', []), start=1):
                    QuizQuestion.objects.update_or_create(
                        id=q['id'],
                        defaults={
                            'quiz': quiz,
                            'text': q.get('text', ''),
                            'question_type': q.get('type', 'single'),
                            'options': q.get('options', []),
                            'correct_answer': q.get('correctAnswer', ''),
                            'explanation': q.get('explanation', ''),
                            'points': q.get('points', 1),
                            'order': idx
                        }
                    )

        self.stdout.write(f"- {sess_count} séances et {quiz_count} questionnaires interactifs importés")

        # 8. User UE Accesses
        for a in data.get('ueAccesses', []):
            user = User.objects.filter(id=a.get('userId')).first()
            ue = UE.objects.filter(id=a.get('ueId')).first()
            if user and ue:
                granted_at = parse_datetime(a.get('grantedAt')) if a.get('grantedAt') else timezone.now()
                UserUEAccess.objects.update_or_create(
                    id=a['id'],
                    defaults={
                        'user': user,
                        'ue': ue,
                        'granted_at': granted_at,
                        'granted_by': a.get('grantedBy', 'system_registration'),
                        'status': a.get('status', 'active'),
                        'is_first_chapter_only': a.get('isFirstChapterOnly', False)
                    }
                )
        self.stdout.write(f"- {len(data.get('ueAccesses', []))} autorisations d'accès UE importées")

        # 9. Session Progress
        for p in data.get('sessionProgress', []):
            user = User.objects.filter(id=p.get('userId')).first()
            sess = Session.objects.filter(id=p.get('sessionId')).first()
            ue = UE.objects.filter(id=p.get('ueId')).first()
            if user and sess and ue:
                last_acc = parse_datetime(p.get('lastAccessedAt')) if p.get('lastAccessedAt') else timezone.now()
                comp_at = parse_datetime(p.get('completedAt')) if p.get('completedAt') else None
                SessionProgress.objects.update_or_create(
                    id=p['id'],
                    defaults={
                        'user': user,
                        'session': sess,
                        'ue': ue,
                        'status': p.get('status', 'not_started'),
                        'last_accessed_at': last_acc,
                        'completed_at': comp_at
                    }
                )
        self.stdout.write(f"- {len(data.get('sessionProgress', []))} progressions de cours importées")

        # 10. Quiz Attempts
        for att in data.get('quizAttempts', []):
            user = User.objects.filter(id=att.get('userId')).first()
            quiz = Quiz.objects.filter(id=att.get('quizId')).first()
            sess = Session.objects.filter(id=att.get('sessionId')).first()
            ue = UE.objects.filter(id=att.get('ueId')).first()
            if user and quiz and sess and ue:
                sub_at = parse_datetime(att.get('submittedAt')) if att.get('submittedAt') else timezone.now()
                QuizAttempt.objects.update_or_create(
                    id=att['id'],
                    defaults={
                        'user': user,
                        'quiz': quiz,
                        'session': sess,
                        'ue': ue,
                        'score': att.get('score', 0),
                        'max_score': att.get('maxScore', 0),
                        'percentage': att.get('percentage', 0),
                        'passed': att.get('passed', False),
                        'user_answers': att.get('userAnswers', {}),
                        'submitted_at': sub_at
                    }
                )
        self.stdout.write(f"- {len(data.get('quizAttempts', []))} tentatives de questionnaires importées")

        # 11. Dynamic Forms
        for f_data in data.get('forms', []):
            cr_at = parse_datetime(f_data.get('createdAt')) if f_data.get('createdAt') else timezone.now()
            DynamicForm.objects.update_or_create(
                id=f_data['id'],
                defaults={
                    'title': f_data.get('title', ''),
                    'description': f_data.get('description', ''),
                    'theme_color': f_data.get('themeColor', '#075E54'),
                    'is_active': f_data.get('isActive', True),
                    'fields': f_data.get('fields', []),
                    'created_at': cr_at
                }
            )
        self.stdout.write(f"- {len(data.get('forms', []))} formulaires dynamiques importés")

        # 12. Form Submissions
        for s_data in data.get('formSubmissions', []):
            form = DynamicForm.objects.filter(id=s_data.get('formId')).first()
            user = User.objects.filter(id=s_data.get('userId')).first()
            if form:
                sub_at = parse_datetime(s_data.get('submittedAt')) if s_data.get('submittedAt') else timezone.now()
                FormSubmission.objects.update_or_create(
                    id=s_data['id'],
                    defaults={
                        'form': form,
                        'user': user,
                        'user_name': s_data.get('userName', 'Visiteur'),
                        'user_phone': s_data.get('userPhone', ''),
                        'data': s_data.get('data', {}),
                        'submitted_at': sub_at
                    }
                )
        self.stdout.write(f"- {len(data.get('formSubmissions', []))} soumissions de formulaires importées")

        # 13. Promo Codes
        promo_list = data.get('promoCodes', [])
        if not promo_list:
            promo_list = [
                {
                    'id': 'promo_reussite20',
                    'code': 'REUSSITE20',
                    'discountPercent': 20,
                    'applicableTo': 'all',
                    'isActive': True,
                    'createdAt': '2026-01-01T00:00:00.000Z',
                    'createdBy': 'Superuser'
                },
                {
                    'id': 'promo_examen50',
                    'code': 'EXAMEN50',
                    'discountPercent': 50,
                    'applicableTo': 'ue_unlock',
                    'isActive': True,
                    'createdAt': '2026-01-01T00:00:00.000Z',
                    'createdBy': 'Superuser'
                }
            ]

        for pr in promo_list:
            cr_at = parse_datetime(pr.get('createdAt')) if pr.get('createdAt') else timezone.now()
            PromoCode.objects.update_or_create(
                id=pr['id'],
                defaults={
                    'code': pr['code'].upper(),
                    'discount_percent': pr.get('discountPercent', 10),
                    'applicable_to': pr.get('applicableTo', 'all'),
                    'is_active': pr.get('isActive', True),
                    'created_by': pr.get('createdBy', ''),
                    'created_at': cr_at
                }
            )
        self.stdout.write(f"- {len(promo_list)} codes promotionnels importés")

        # 14. Unlock Requests
        for req in data.get('unlockRequests', []):
            user = User.objects.filter(id=req.get('userId')).first()
            if user:
                cr_at = parse_datetime(req.get('createdAt')) if req.get('createdAt') else timezone.now()
                rev_at = parse_datetime(req.get('reviewedAt')) if req.get('reviewedAt') else None
                UnlockRequest.objects.update_or_create(
                    id=req['id'],
                    defaults={
                        'user': user,
                        'user_name': req.get('userName', ''),
                        'user_phone': req.get('userPhone', ''),
                        'ue_ids': req.get('ueIds', []),
                        'ue_codes': req.get('ueCodes', []),
                        'promo_code': req.get('promoCode'),
                        'discount_percent': req.get('discountPercent'),
                        'subtotal_fcfa': req.get('subtotalFcfa', 0),
                        'transaction_fee_fcfa': req.get('transactionFeeFcfa', 100),
                        'total_fcfa': req.get('totalFcfa', 0),
                        'status': req.get('status', 'pending'),
                        'payment_method': req.get('paymentMethod', 'Mix Togo / Flooz Togo'),
                        'notes': req.get('notes', ''),
                        'created_at': cr_at,
                        'reviewed_at': rev_at,
                        'reviewed_by': req.get('reviewedBy', '')
                    }
                )
        self.stdout.write(f"- {len(data.get('unlockRequests', []))} demandes de déblocage importées")

        # 15. Audit Logs
        for aud in data.get('auditLogs', []):
            ts = parse_datetime(aud.get('timestamp')) if aud.get('timestamp') else timezone.now()
            user = User.objects.filter(id=aud.get('userId')).first() if aud.get('userId') else None
            AuditLog.objects.update_or_create(
                id=aud['id'],
                defaults={
                    'timestamp': ts,
                    'user': user,
                    'user_phone': aud.get('userPhone', ''),
                    'user_role': aud.get('userRole', ''),
                    'action': aud.get('action', ''),
                    'resource': aud.get('resource', ''),
                    'details': aud.get('details', ''),
                    'ip': aud.get('ip', '')
                }
            )
        self.stdout.write(f"- {len(data.get('auditLogs', []))} entrées du journal d'audit importées")

        # 16. Internal Notifications
        superuser = User.objects.filter(role='SUPERUSER').first()
        initial_notifs = [
            {
                'id': 'notif_welcome_all',
                'title': 'Bienvenue sur UL Study Flow ! 🎓',
                'message': 'Votre plateforme d\'apprentissage et de révision pour réussir vos études universitaires à l\'Université de Lomé.',
                'type': 'success',
                'priority': 'normal',
                'target_type': 'ALL',
                'status': 'SENT',
                'action_url': 'student_courses',
            },
            {
                'id': 'notif_promo_active',
                'title': 'Code Promo Spécial Disponible 🚀',
                'message': 'Profitez de -20% sur le déblocage complet de vos UE avec le code REUSSITE20.',
                'type': 'info',
                'priority': 'normal',
                'target_type': 'ALL',
                'status': 'SENT',
                'action_url': 'student_courses',
            }
        ]

        for n_data in initial_notifs:
            Notification.objects.update_or_create(
                id=n_data['id'],
                defaults={
                    'title': n_data['title'],
                    'message': n_data['message'],
                    'notification_type': n_data['type'],
                    'priority': n_data['priority'],
                    'target_type': n_data['target_type'],
                    'status': n_data['status'],
                    'action_url': n_data.get('action_url'),
                    'created_by': superuser,
                    'created_at': timezone.now()
                }
            )
        self.stdout.write("- Notifications initiales créées")

        self.stdout.write(self.style.SUCCESS("Importation terminée avec succès !"))
