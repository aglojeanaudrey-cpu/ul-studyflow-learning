"""
Service de corbeille pour UL Study Flow.

Gère la suppression (soft-delete), la restauration (avec cascade) et la purge
des éléments admin avec rétention de 30 jours.

Chaque suppression sauvegarde un snapshot JSON complet de l'objet + ses
dépendances, permettant une restauration intégrale.
"""

from datetime import timedelta
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from .models import TrashBin


# =============================================================================
# HELPERS INTERNES
# =============================================================================

def _record_to_trash(object_type, obj, display_name, snapshot, deleted_by, reason=''):
    """Enregistre un objet dans la corbeille."""
    return TrashBin.objects.create(
        object_type=object_type,
        object_id=obj.id,
        display_name=display_name,
        snapshot=snapshot,
        deleted_by=deleted_by,
        deleted_by_phone=deleted_by.phone if deleted_by else '',
        deleted_at=timezone.now(),
        expires_at=timezone.now() + timedelta(days=30),
        deletion_reason=reason,
    )


# =============================================================================
# SNAPSHOTS (créent un dict JSON complet de l'objet + dépendances)
# =============================================================================

def _snapshot_ue(ue):
    """Snapshot complet d'une UE + ses séances + chapitres + quiz."""
    from courses.models import Session, Chapter, Quiz, QuizQuestion

    sessions_data = []
    for session in ue.sessions.all():
        chapters_data = []
        for chapter in session.chapters.all():
            quiz_data = None
            if hasattr(chapter, 'quiz') and chapter.quiz:
                quiz = chapter.quiz
                quiz_data = {
                    'id': quiz.id,
                    'title': quiz.title,
                    'description': quiz.description,
                    'passing_score_percent': quiz.passing_score_percent,
                    'questions': [
                        {
                            'id': q.id,
                            'text': q.text,
                            'question_type': q.question_type,
                            'options': q.options,
                            'correct_answer': q.correct_answer,
                            'explanation': q.explanation,
                            'points': q.points,
                            'order': q.order,
                        }
                        for q in quiz.questions.all()
                    ],
                }

            chapters_data.append({
                'id': chapter.id,
                'number': chapter.number,
                'title': chapter.title,
                'objectives': chapter.objectives,
                'order': chapter.order,
                'summary_text': chapter.summary_text,
                'video': chapter.video,
                'audio': chapter.audio,
                'pdf': chapter.pdf,
                'flashcards': chapter.flashcards,
                'quiz': quiz_data,
            })

        # Quiz de session (s'il existe)
        session_quiz_data = None
        if hasattr(session, 'quiz') and session.quiz:
            sq = session.quiz
            session_quiz_data = {
                'id': sq.id,
                'title': sq.title,
                'description': sq.description,
                'passing_score_percent': sq.passing_score_percent,
                'questions': [
                    {
                        'id': q.id,
                        'text': q.text,
                        'question_type': q.question_type,
                        'options': q.options,
                        'correct_answer': q.correct_answer,
                        'explanation': q.explanation,
                        'points': q.points,
                        'order': q.order,
                    }
                    for q in sq.questions.all()
                ],
            }

        sessions_data.append({
            'id': session.id,
            'session_number': session.session_number,
            'title': session.title,
            'description': session.description,
            'objective': session.objective,
            'estimated_minutes': session.estimated_minutes,
            'order': session.order,
            'is_published': session.is_published,
            'is_suspended': session.is_suspended,
            'is_locked_for_users': session.is_locked_for_users,
            'chapters': chapters_data,
            'quiz': session_quiz_data,
        })

    return {
        'ue': {
            'id': ue.id,
            'code': ue.code,
            'title': ue.title,
            'description': ue.description,
            'objective': ue.objective,
            'department_id': ue.department_id,
            'program_id': ue.program_id,
            'level': ue.level,
            'semester': ue.semester,
            'academic_year': ue.academic_year,
            'is_published': ue.is_published,
            'is_suspended': ue.is_suspended,
            'price_fcfa': ue.price_fcfa,
            'order': ue.order,
            'image_url': ue.image_url,
            'coefficient': ue.coefficient,
            'credit_ects': ue.credit_ects,
        },
        'sessions': sessions_data,
    }


def _snapshot_session(session):
    """Snapshot d'une séance + ses chapitres + quiz."""
    from courses.models import Chapter, Quiz

    chapters_data = []
    for chapter in session.chapters.all():
        quiz_data = None
        if hasattr(chapter, 'quiz') and chapter.quiz:
            quiz = chapter.quiz
            quiz_data = {
                'id': quiz.id,
                'title': quiz.title,
                'description': quiz.description,
                'passing_score_percent': quiz.passing_score_percent,
                'questions': [
                    {
                        'id': q.id,
                        'text': q.text,
                        'question_type': q.question_type,
                        'options': q.options,
                        'correct_answer': q.correct_answer,
                        'explanation': q.explanation,
                        'points': q.points,
                        'order': q.order,
                    }
                    for q in quiz.questions.all()
                ],
            }

        chapters_data.append({
            'id': chapter.id,
            'number': chapter.number,
            'title': chapter.title,
            'objectives': chapter.objectives,
            'order': chapter.order,
            'summary_text': chapter.summary_text,
            'video': chapter.video,
            'audio': chapter.audio,
            'pdf': chapter.pdf,
            'flashcards': chapter.flashcards,
            'quiz': quiz_data,
        })

    session_quiz_data = None
    if hasattr(session, 'quiz') and session.quiz:
        sq = session.quiz
        session_quiz_data = {
            'id': sq.id,
            'title': sq.title,
            'description': sq.description,
            'passing_score_percent': sq.passing_score_percent,
            'questions': [
                {
                    'id': q.id,
                    'text': q.text,
                    'question_type': q.question_type,
                    'options': q.options,
                    'correct_answer': q.correct_answer,
                    'explanation': q.explanation,
                    'points': q.points,
                    'order': q.order,
                }
                for q in sq.questions.all()
            ],
        }

    return {
        'session': {
            'id': session.id,
            'ue_id': session.ue_id,
            'session_number': session.session_number,
            'title': session.title,
            'description': session.description,
            'objective': session.objective,
            'estimated_minutes': session.estimated_minutes,
            'order': session.order,
            'is_published': session.is_published,
            'is_suspended': session.is_suspended,
            'is_locked_for_users': session.is_locked_for_users,
            'quiz': session_quiz_data,
        },
        'chapters': chapters_data,
    }


def _snapshot_chapter(chapter):
    """Snapshot d'un chapitre + son quiz."""
    quiz_data = None
    if hasattr(chapter, 'quiz') and chapter.quiz:
        quiz = chapter.quiz
        quiz_data = {
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'passing_score_percent': quiz.passing_score_percent,
            'questions': [
                {
                    'id': q.id,
                    'text': q.text,
                    'question_type': q.question_type,
                    'options': q.options,
                    'correct_answer': q.correct_answer,
                    'explanation': q.explanation,
                    'points': q.points,
                    'order': q.order,
                }
                for q in quiz.questions.all()
            ],
        }

    return {
        'chapter': {
            'id': chapter.id,
            'session_id': chapter.session_id,
            'number': chapter.number,
            'title': chapter.title,
            'objectives': chapter.objectives,
            'order': chapter.order,
            'summary_text': chapter.summary_text,
            'video': chapter.video,
            'audio': chapter.audio,
            'pdf': chapter.pdf,
            'flashcards': chapter.flashcards,
            'quiz': quiz_data,
        }
    }


def _snapshot_user(user):
    """Snapshot d'un utilisateur (sans mot de passe)."""
    return {
        'user': {
            'id': user.id,
            'phone': user.phone,
            'display_phone': user.display_phone,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'department': user.department,
            'program': user.program,
            'level': user.level,
            'role': user.role,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'is_sponsored': user.is_sponsored,
            'is_ai_suspended': user.is_ai_suspended,
            'admin_permissions': user.admin_permissions,
            'password_hash': user.password,  # Hash Django (on le garde pour restaurer)
            'password_hash_legacy': user.password_hash,
            'password_salt': user.password_salt,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'last_login_at': user.last_login_at.isoformat() if user.last_login_at else None,
        }
    }


def _snapshot_popup(popup):
    """Snapshot d'un popup publicitaire."""
    return {
        'popup': {
            'id': popup.id,
            'title': popup.title,
            'message': popup.message,
            'popup_type': popup.popup_type,
            'template_used': popup.template_used,
            'media_type': popup.media_type,
            'media_url': popup.media_url,
            'media_thumbnail': popup.media_thumbnail,
            'primary_button_text': popup.primary_button_text,
            'primary_button_action': popup.primary_button_action,
            'primary_button_url': popup.primary_button_url,
            'secondary_button_text': popup.secondary_button_text,
            'secondary_button_action': popup.secondary_button_action,
            'secondary_button_url': popup.secondary_button_url,
            'size': popup.size,
            'position': popup.position,
            'accent_color': popup.accent_color,
            'animation': popup.animation,
            'is_dismissible': popup.is_dismissible,
            'target_pages': popup.target_pages,
            'target_audience': popup.target_audience,
            'target_departments': popup.target_departments,
            'target_programs': popup.target_programs,
            'target_levels': popup.target_levels,
            'trigger_type': popup.trigger_type,
            'trigger_delay_seconds': popup.trigger_delay_seconds,
            'trigger_scroll_percent': popup.trigger_scroll_percent,
            'frequency': popup.frequency,
            'frequency_custom_hours': popup.frequency_custom_hours,
            'schedule_days': popup.schedule_days,
            'schedule_hours_start': popup.schedule_hours_start,
            'schedule_hours_end': popup.schedule_hours_end,
            'schedule_specific_dates': popup.schedule_specific_dates,
            'schedule_timezone': popup.schedule_timezone,
            'is_active': popup.is_active,
            'priority': popup.priority,
            'starts_at': popup.starts_at.isoformat() if popup.starts_at else None,
            'ends_at': popup.ends_at.isoformat() if popup.ends_at else None,
            'views_count': popup.views_count,
            'clicks_count': popup.clicks_count,
            'created_at': popup.created_at.isoformat() if popup.created_at else None,
            'created_by': popup.created_by,
        }
    }


def _snapshot_form(form):
    """Snapshot d'un formulaire + ses soumissions."""
    submissions_data = []
    for sub in form.submissions.all():
        submissions_data.append({
            'id': sub.id,
            'user_id': sub.user_id,
            'user_name': sub.user_name,
            'user_phone': sub.user_phone,
            'data': sub.data,
            'submitted_at': sub.submitted_at.isoformat() if sub.submitted_at else None,
        })

    return {
        'form': {
            'id': form.id,
            'title': form.title,
            'description': form.description,
            'theme_color': form.theme_color,
            'is_active': form.is_active,
            'created_at': form.created_at.isoformat() if form.created_at else None,
            'fields': form.fields,
        },
        'submissions': submissions_data,
    }


# =============================================================================
# API PUBLIQUE DU SERVICE
# =============================================================================

def move_to_trash_ue(ue, deleted_by, reason=''):
    """Déplace une UE + ses dépendances vers la corbeille."""
    snapshot = _snapshot_ue(ue)
    display_name = f"{ue.code} - {ue.title}"

    entry = _record_to_trash(
        object_type='ue',
        obj=ue,
        display_name=display_name,
        snapshot=snapshot,
        deleted_by=deleted_by,
        reason=reason,
    )

    # Suppression réelle (cascade automatique)
    ue.delete()
    return entry


def move_to_trash_session(session, deleted_by, reason=''):
    snapshot = _snapshot_session(session)
    display_name = f"Séance {session.session_number} : {session.title}"
    entry = _record_to_trash(
        object_type='session',
        obj=session,
        display_name=display_name,
        snapshot=snapshot,
        deleted_by=deleted_by,
        reason=reason,
    )
    session.delete()
    return entry


def move_to_trash_chapter(chapter, deleted_by, reason=''):
    snapshot = _snapshot_chapter(chapter)
    display_name = f"Chapitre {chapter.number} : {chapter.title}"
    entry = _record_to_trash(
        object_type='chapter',
        obj=chapter,
        display_name=display_name,
        snapshot=snapshot,
        deleted_by=deleted_by,
        reason=reason,
    )
    chapter.delete()
    return entry


def move_to_trash_user(user, deleted_by, reason=''):
    snapshot = _snapshot_user(user)
    display_name = f"{user.first_name} {user.last_name} ({user.phone})"
    entry = _record_to_trash(
        object_type='user',
        obj=user,
        display_name=display_name,
        snapshot=snapshot,
        deleted_by=deleted_by,
        reason=reason,
    )
    user.delete()
    return entry


def move_to_trash_popup(popup, deleted_by, reason=''):
    snapshot = _snapshot_popup(popup)
    display_name = f"{popup.title} ({popup.popup_type})"
    entry = _record_to_trash(
        object_type='popup',
        obj=popup,
        display_name=display_name,
        snapshot=snapshot,
        deleted_by=deleted_by,
        reason=reason,
    )
    popup.delete()
    return entry


def move_to_trash_form(form, deleted_by, reason=''):
    snapshot = _snapshot_form(form)
    display_name = f"{form.title} ({form.submissions.count()} réponses)"
    entry = _record_to_trash(
        object_type='form',
        obj=form,
        display_name=display_name,
        snapshot=snapshot,
        deleted_by=deleted_by,
        reason=reason,
    )
    form.delete()
    return entry


# =============================================================================
# RESTAURATION
# =============================================================================

@transaction.atomic
def restore_from_trash(trash_entry, restored_by):
    """Restaure un objet depuis la corbeille (avec cascade)."""
    if trash_entry.is_restored:
        raise ValueError("Cet élément a déjà été restauré.")

    if trash_entry.is_expired:
        raise ValueError("Cet élément a expiré et ne peut plus être restauré.")

    snapshot = trash_entry.snapshot
    object_type = trash_entry.object_type

    try:
        if object_type == 'ue':
            _restore_ue(snapshot)
        elif object_type == 'session':
            _restore_session(snapshot)
        elif object_type == 'chapter':
            _restore_chapter(snapshot)
        elif object_type == 'user':
            _restore_user(snapshot)
        elif object_type == 'popup':
            _restore_popup(snapshot)
        elif object_type == 'form':
            _restore_form(snapshot)
        else:
            raise ValueError(f"Type d'objet inconnu : {object_type}")

        trash_entry.is_restored = True
        trash_entry.restored_at = timezone.now()
        trash_entry.restored_by = restored_by
        trash_entry.save()

        return True
    except Exception as e:
        raise Exception(f"Erreur lors de la restauration : {str(e)}")


def _restore_ue(snapshot):
    """Restaure une UE + séances + chapitres + quiz."""
    from courses.models import UE, Session, Chapter, Quiz, QuizQuestion
    from academic.models import Department, Program

    ue_data = snapshot['ue']

    # Récupérer les relations
    dept = Department.objects.filter(id=ue_data.get('department_id')).first()
    prog = Program.objects.filter(id=ue_data.get('program_id')).first()

    # Recréer l'UE avec le même ID
    ue = UE(
        id=ue_data['id'],
        code=ue_data['code'],
        title=ue_data['title'],
        description=ue_data.get('description', ''),
        objective=ue_data.get('objective', ''),
        department=dept,
        program=prog,
        level=ue_data.get('level', 'L1'),
        semester=ue_data.get('semester', 'Semestre 1'),
        academic_year=ue_data.get('academic_year', '2025-2026'),
        is_published=ue_data.get('is_published', True),
        is_suspended=ue_data.get('is_suspended', False),
        price_fcfa=ue_data.get('price_fcfa', 500),
        order=ue_data.get('order', 1),
        image_url=ue_data.get('image_url'),
        coefficient=ue_data.get('coefficient', 2),
        credit_ects=ue_data.get('credit_ects', 4),
    )
    ue.save()

    # Restaurer les séances
    for sess_data in snapshot.get('sessions', []):
        session = Session(
            id=sess_data['id'],
            ue=ue,
            session_number=sess_data['session_number'],
            title=sess_data['title'],
            description=sess_data.get('description', ''),
            objective=sess_data.get('objective', ''),
            estimated_minutes=sess_data.get('estimated_minutes', 45),
            order=sess_data.get('order', 1),
            is_published=sess_data.get('is_published', True),
            is_suspended=sess_data.get('is_suspended', False),
            is_locked_for_users=sess_data.get('is_locked_for_users'),
        )
        session.save()

        # Quiz de session
        sess_quiz_data = sess_data.get('quiz')
        if sess_quiz_data:
            _restore_quiz(sess_quiz_data, session=session)

        # Restaurer les chapitres
        for chap_data in sess_data.get('chapters', []):
            chapter = Chapter(
                id=chap_data['id'],
                session=session,
                number=chap_data['number'],
                title=chap_data['title'],
                objectives=chap_data.get('objectives', ''),
                order=chap_data.get('order', 1),
                summary_text=chap_data.get('summary_text', ''),
                video=chap_data.get('video', {}),
                audio=chap_data.get('audio', {}),
                pdf=chap_data.get('pdf', {}),
                flashcards=chap_data.get('flashcards', []),
            )
            chapter.save()

            chap_quiz_data = chap_data.get('quiz')
            if chap_quiz_data:
                _restore_quiz(chap_quiz_data, chapter=chapter)


def _restore_session(snapshot):
    """Restaure une séance + chapitres."""
    from courses.models import Session, Chapter, UE

    sess_data = snapshot['session']
    ue = UE.objects.filter(id=sess_data['ue_id']).first()
    if not ue:
        raise ValueError("L'UE parente n'existe plus. Restaurez d'abord l'UE.")

    session = Session(
        id=sess_data['id'],
        ue=ue,
        session_number=sess_data['session_number'],
        title=sess_data['title'],
        description=sess_data.get('description', ''),
        objective=sess_data.get('objective', ''),
        estimated_minutes=sess_data.get('estimated_minutes', 45),
        order=sess_data.get('order', 1),
        is_published=sess_data.get('is_published', True),
        is_suspended=sess_data.get('is_suspended', False),
        is_locked_for_users=sess_data.get('is_locked_for_users'),
    )
    session.save()

    if sess_data.get('quiz'):
        _restore_quiz(sess_data['quiz'], session=session)

    for chap_data in snapshot.get('chapters', []):
        chapter = Chapter(
            id=chap_data['id'],
            session=session,
            number=chap_data['number'],
            title=chap_data['title'],
            objectives=chap_data.get('objectives', ''),
            order=chap_data.get('order', 1),
            summary_text=chap_data.get('summary_text', ''),
            video=chap_data.get('video', {}),
            audio=chap_data.get('audio', {}),
            pdf=chap_data.get('pdf', {}),
            flashcards=chap_data.get('flashcards', []),
        )
        chapter.save()

        if chap_data.get('quiz'):
            _restore_quiz(chap_data['quiz'], chapter=chapter)


def _restore_chapter(snapshot):
    """Restaure un chapitre."""
    from courses.models import Chapter, Session

    chap_data = snapshot['chapter']
    session = Session.objects.filter(id=chap_data['session_id']).first()
    if not session:
        raise ValueError("La séance parente n'existe plus. Restaurez d'abord la séance.")

    chapter = Chapter(
        id=chap_data['id'],
        session=session,
        number=chap_data['number'],
        title=chap_data['title'],
        objectives=chap_data.get('objectives', ''),
        order=chap_data.get('order', 1),
        summary_text=chap_data.get('summary_text', ''),
        video=chap_data.get('video', {}),
        audio=chap_data.get('audio', {}),
        pdf=chap_data.get('pdf', {}),
        flashcards=chap_data.get('flashcards', []),
    )
    chapter.save()

    if chap_data.get('quiz'):
        _restore_quiz(chap_data['quiz'], chapter=chapter)


def _restore_quiz(quiz_data, session=None, chapter=None):
    """Restaure un quiz + ses questions."""
    from courses.models import Quiz, QuizQuestion

    quiz = Quiz(
        id=quiz_data['id'],
        session=session,
        chapter=chapter,
        title=quiz_data['title'],
        description=quiz_data.get('description', ''),
        passing_score_percent=quiz_data.get('passing_score_percent', 75),
    )
    quiz.save()

    for q_data in quiz_data.get('questions', []):
        q = QuizQuestion(
            id=q_data['id'],
            quiz=quiz,
            text=q_data['text'],
            question_type=q_data.get('question_type', 'single'),
            options=q_data.get('options', []),
            correct_answer=q_data.get('correct_answer', ''),
            explanation=q_data.get('explanation', ''),
            points=q_data.get('points', 1),
            order=q_data.get('order', 1),
        )
        q.save()


def _restore_user(snapshot):
    """Restaure un utilisateur avec son mot de passe."""
    user_data = snapshot['user']

    user = User(
        id=user_data['id'],
        phone=user_data['phone'],
        display_phone=user_data.get('display_phone', ''),
        email=user_data.get('email'),
        first_name=user_data['first_name'],
        last_name=user_data['last_name'],
        department=user_data.get('department', 'FASEG'),
        program=user_data.get('program', ''),
        level=user_data.get('level', 'L1'),
        role=user_data.get('role', 'USER'),
        is_active=user_data.get('is_active', True),
        is_staff=user_data.get('is_staff', False),
        is_superuser=user_data.get('is_superuser', False),
        is_sponsored=user_data.get('is_sponsored', False),
        is_ai_suspended=user_data.get('is_ai_suspended', False),
        admin_permissions=user_data.get('admin_permissions', []),
    )

    # Restaurer le hash du mot de passe
    if user_data.get('password_hash'):
        user.password = user_data['password_hash']
    if user_data.get('password_hash_legacy'):
        user.password_hash = user_data['password_hash_legacy']
        user.password_salt = user_data.get('password_salt', '')

    user.save()

    # Restaurer le code de parrainage
    try:
        from referrals.models import ReferralCode
        ReferralCode.objects.get_or_create(user=user)
    except Exception:
        pass


def _restore_popup(snapshot):
    """Restaure un popup."""
    from ads.models import PopupCampaign
    from django.utils.dateparse import parse_datetime

    data = snapshot['popup']

    popup = PopupCampaign(
        id=data['id'],
        title=data['title'],
        message=data.get('message', ''),
        popup_type=data.get('popup_type', 'info'),
        template_used=data.get('template_used', ''),
        media_type=data.get('media_type', 'none'),
        media_url=data.get('media_url'),
        media_thumbnail=data.get('media_thumbnail'),
        primary_button_text=data.get('primary_button_text', ''),
        primary_button_action=data.get('primary_button_action', 'link'),
        primary_button_url=data.get('primary_button_url'),
        secondary_button_text=data.get('secondary_button_text', ''),
        secondary_button_action=data.get('secondary_button_action', 'close'),
        secondary_button_url=data.get('secondary_button_url'),
        size=data.get('size', 'md'),
        position=data.get('position', 'center'),
        accent_color=data.get('accent_color', '#25D366'),
        animation=data.get('animation', 'fade'),
        is_dismissible=data.get('is_dismissible', True),
        target_pages=data.get('target_pages', []),
        target_audience=data.get('target_audience', 'all'),
        target_departments=data.get('target_departments', []),
        target_programs=data.get('target_programs', []),
        target_levels=data.get('target_levels', []),
        trigger_type=data.get('trigger_type', 'after_delay'),
        trigger_delay_seconds=data.get('trigger_delay_seconds', 3),
        trigger_scroll_percent=data.get('trigger_scroll_percent', 50),
        frequency=data.get('frequency', 'once'),
        frequency_custom_hours=data.get('frequency_custom_hours', 24),
        schedule_days=data.get('schedule_days', []),
        schedule_hours_start=data.get('schedule_hours_start', ''),
        schedule_hours_end=data.get('schedule_hours_end', ''),
        schedule_specific_dates=data.get('schedule_specific_dates', []),
        schedule_timezone=data.get('schedule_timezone', 'Africa/Lome'),
        is_active=data.get('is_active', True),
        priority=data.get('priority', 0),
        views_count=data.get('views_count', 0),
        clicks_count=data.get('clicks_count', 0),
        created_by=data.get('created_by', ''),
    )
    if data.get('starts_at'):
        popup.starts_at = parse_datetime(data['starts_at'])
    if data.get('ends_at'):
        popup.ends_at = parse_datetime(data['ends_at'])
    popup.save()


def _restore_form(snapshot):
    """Restaure un formulaire + ses soumissions."""
    from forms_builder.models import DynamicForm, FormSubmission
    from django.utils.dateparse import parse_datetime

    data = snapshot['form']

    form = DynamicForm(
        id=data['id'],
        title=data['title'],
        description=data.get('description', ''),
        theme_color=data.get('theme_color', '#075E54'),
        is_active=data.get('is_active', True),
        fields=data.get('fields', []),
    )
    form.save()

    for sub_data in snapshot.get('submissions', []):
        sub = FormSubmission(
            id=sub_data['id'],
            form=form,
            user_id=sub_data.get('user_id'),
            user_name=sub_data.get('user_name', 'Visiteur'),
            user_phone=sub_data.get('user_phone', ''),
            data=sub_data.get('data', {}),
        )
        if sub_data.get('submitted_at'):
            sub.submitted_at = parse_datetime(sub_data['submitted_at'])
        sub.save()


# =============================================================================
# PURGE
# =============================================================================

def purge_expired_trash():
    """Supprime définitivement les entrées expirées (> 30 jours)."""
    expired = TrashBin.objects.filter(
        expires_at__lt=timezone.now(),
        is_restored=False
    )
    count = expired.count()
    expired.delete()
    return count