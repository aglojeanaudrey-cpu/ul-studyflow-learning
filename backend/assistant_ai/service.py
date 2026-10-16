"""
Service de l'Assistant Pédagogique UL Study Flow (Gemini).

Architecture :
- Le contenu pédagogique est GÉNÉRÉ EN AMONT et stocké dans Session.summary_text.
- L'IA ici ne fait QUE expliquer / reformuler / approfondir à partir de ce contenu.
- Aucune connaissance externe n'est autorisée.
"""

import os
import logging
from django.conf import settings
from accounts.models import User
from courses.models import UE, Session, UserUEAccess

from .prompts import (
    REFUSAL_MESSAGE,
    AI_BUSY_IN_SESSION,
    AI_BUSY_OUT_OF_SESSION,
    build_system_instruction_in_session,
    build_system_instruction_welcome,
    build_system_instruction_ue_context,
    build_system_instruction_general,
)

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# Garde-fous (prompt injection & demandes d'infos sensibles)
# ─────────────────────────────────────────────────────────────
DANGEROUS_PATTERNS = [
    'ignore all previous instructions',
    'ignore previous instructions',
    'ignore les instructions',
    'system prompt',
    'instructions système',
    'révèle tes instructions',
    'api key',
    'clé api',
    'secret_key',
    'secret key',
    'dump database',
    'base de données',
    'all passwords',
    'tous les mots de passe',
    'admin password',
    'mot de passe admin',
    'environment variables',
    'variables environnement',
    'process.env',
    'liste des utilisateurs',
    'liste des étudiants',
    'email de',
    'numéro de',
    'téléphone de',
]


def _contains_dangerous_pattern(message: str) -> bool:
    low = message.lower()
    return any(p in low for p in DANGEROUS_PATTERNS)


# ─────────────────────────────────────────────────────────────
# Messages de repli élégants (jamais de mention technique)
# ─────────────────────────────────────────────────────────────
def _fallback_busy(user: User, active_session=None) -> str:
    """Message renvoyé quand l'IA ne peut pas répondre temporairement."""
    if active_session:
        return AI_BUSY_IN_SESSION.format(session_title=active_session.title)
    return AI_BUSY_OUT_OF_SESSION


def _fallback_no_api_key(user: User) -> str:
    """Message quand la clé API n'est pas configurée (dev / préprod)."""
    return AI_BUSY_OUT_OF_SESSION


def _fallback_local(user: User) -> str:
    """Conservé pour compatibilité."""
    return _fallback_busy(user)


def _support_message_suspended() -> str:
    """Message affiché quand l'admin a suspendu l'IA pour cet étudiant."""
    phone = getattr(settings, 'SUPPORT_PHONE', '') or ''
    phone_alt = getattr(settings, 'SUPPORT_PHONE_ALT', '') or ''
    email = getattr(settings, 'SUPPORT_EMAIL', '') or ''

    contacts = []
    if phone:
        contacts.append(phone)
    if phone_alt:
        contacts.append(phone_alt)
    if email:
        contacts.append(email)

    contact_str = (
        " ou ".join(contacts) if contacts
        else "l'administration UL Study Flow"
    )

    return (
        "L'accès à l'assistance IA a été temporairement suspendu ou limité "
        "par l'administrateur. Veuillez contacter le support pédagogique "
        f"UL Study Flow au {contact_str}."
    )


# ─────────────────────────────────────────────────────────────
# Récupération du contexte autorisé
# ─────────────────────────────────────────────────────────────
def _get_user_ues(user: User):
    if user.role in ('SUPERUSER', 'STAFF') or user.is_superuser or user.is_staff or user.is_sponsored:
        return list(UE.objects.filter(is_published=True, is_suspended=False))
    accessible_ids = UserUEAccess.objects.filter(
        user=user, status='active'
    ).values_list('ue_id', flat=True)
    return list(UE.objects.filter(
        id__in=accessible_ids, is_published=True, is_suspended=False
    ))


def _build_ues_summary(ues) -> str:
    if not ues:
        return "Aucune UE débloquée pour le moment."
    return '\n'.join([f"- {u.code} : {u.title} ({u.level}, {u.semester})" for u in ues])


def _get_session_if_authorized(user: User, session_id: str, user_ues):
    if not session_id:
        return None
    session = (
        Session.objects
        .filter(id=session_id, is_published=True, is_suspended=False)
        .select_related('ue')
        .first()
    )
    if not session:
        return None
    allowed_ids = {u.id for u in user_ues}
    if session.ue_id not in allowed_ids:
        return None
    return session


def _get_ue_if_authorized(user, ue_id, user_ues):
    """Retourne l'UE si l'utilisateur y a accès, sinon None."""
    if not ue_id:
        return None
    allowed_ids = {u.id for u in user_ues}
    if ue_id not in allowed_ids:
        return None
    return next((u for u in user_ues if u.id == ue_id), None)

def _build_ue_context(ue) -> str:
    """
    Construit un résumé textuel de toute l'UE :
    titre, description, sessions avec extraits de chapitres.
    """
    lines = []
    lines.append(f"UE : {ue.title} ({ue.code}) — {ue.level}, {ue.semester}")
    if ue.description:
        lines.append(f"Description : {ue.description}")
    if ue.objective:
        lines.append(f"Objectifs : {ue.objective}")
    lines.append("")

    sessions = ue.sessions.filter(
        is_published=True, is_suspended=False
    ).prefetch_related('chapters').order_by('order', 'session_number')

    for s in sessions:
        lines.append(f"── Séance {s.session_number} : {s.title} ──")
        if s.objective:
            lines.append(f"Objectif : {s.objective}")

        for ch in s.chapters.all().order_by('order', 'number'):
            lines.append(f"\n  ▸ Chapitre {ch.number} : {ch.title}")
            if ch.objectives:
                lines.append(f"    Objectifs : {ch.objectives}")
            # Priorité au summary_text (léger) puis fallback sur le HTML stripé
            content = ch.summary_text or ''
            if not content and ch.summary_html:
                # Strip basique des balises pour alléger le prompt
                import re
                content = re.sub(r'<[^>]+>', ' ', ch.summary_html)
                content = re.sub(r'\s+', ' ', content).strip()
            if content:
                # Limite à 1500 caractères par chapitre pour ne pas exploser le prompt
                lines.append(f"    Contenu : {content[:1500]}")

        lines.append("")

    return "\n".join(lines)

# ─────────────────────────────────────────────────────────────
# Point d'entrée principal
# ─────────────────────────────────────────────────────────────
def ask_pedagogical_assistant(
    user: User,
    user_message: str,
    history: list = None,
    context_session_id: str = None,
    context_ue_id: str = None,       # ⭐ NEW
) -> str:
    history = history or []

    # 1. Suspension
    if user.is_ai_suspended:
        return _support_message_suspended()

    # 2. Validation
    if not user_message or not isinstance(user_message, str):
        return "Votre message est vide ou invalide."

    max_len = getattr(settings, 'AI_MAX_MESSAGE_LENGTH', 2000)
    if len(user_message) > max_len:
        return (
            f"Votre message est trop long ({len(user_message)} caractères). "
            f"Merci de le raccourcir à {max_len} caractères maximum."
        )

    # 3. Garde-fous
    if _contains_dangerous_pattern(user_message):
        return REFUSAL_MESSAGE

    # 4. Contexte autorisé
    user_ues = _get_user_ues(user)
    ues_summary = _build_ues_summary(user_ues)
    active_session = _get_session_if_authorized(user, context_session_id, user_ues)
    active_ue = _get_ue_if_authorized(user, context_ue_id, user_ues)  # ⭐ NEW

    # Si une session est fournie, on remonte son UE automatiquement
    if active_session and not active_ue:
        active_ue = active_session.ue

    # 5. System prompt — 3 cas de figure
    if active_session:
        system_instruction = build_system_instruction_in_session(
            user=user,
            ue=active_session.ue,
            session=active_session,
            ues_summary=ues_summary,
        )
    elif active_ue:
        # mode "UE entière" (toutes les séances + chapitres)
        ue_context = _build_ue_context(active_ue)
        system_instruction = build_system_instruction_ue_context(
            user=user,
            ue=active_ue,
            ue_context=ue_context,
            ues_summary=ues_summary,
        )
    else:
        # Mode général — l'IA répond mais prévient qu'elle sort du cours
        system_instruction = build_system_instruction_general(
            user=user,
            ues_summary=ues_summary,
        )

    # 6. Clé API
    api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.getenv('GEMINI_API_KEY', '')
    if not api_key:
        logger.warning("GEMINI_API_KEY manquante — message de repli renvoyé.")
        return _fallback_no_api_key(user)

    # 7. Appel Gemini (cascade de modèles + message de repli élégant)
    try:
        from google import genai

        client = genai.Client(api_key=api_key)

        # Historique borné
        max_hist = getattr(settings, 'AI_MAX_HISTORY_MESSAGES', 10)
        cleaned_history = []
        for item in history[-max_hist:]:
            if not isinstance(item, dict):
                continue
            role = item.get('role', 'user')
            text = (item.get('text') or '').strip()
            if not text:
                continue
            label = 'Étudiant' if role == 'user' else 'Assistant'
            cleaned_history.append(f"{label}: {text}")

        conversation = cleaned_history + [f"Étudiant: {user_message}"]
        prompt = (
            f"{system_instruction}\n\n"
            "Conversation :\n" + "\n".join(conversation) + "\n\nAssistant:"
        )

        # Cascade de modèles
        primary_model = getattr(settings, 'GEMINI_MODEL', 'gemini-3.5-flash-lite')
        fallback_models = [
            primary_model,                 # gemini-3.5-flash-lite
            'gemini-3.5-flash',            # version pleine (si lite indisponible)
            'gemini-3.6-flash',            # alternative stable
            'gemini-3.8-flash',            # flagship (dernier recours)
            'gemini-3.1-flash-lite',       # dernière chance lite
        ]

        seen = set()
        models_to_try = []
        for m in fallback_models:
            if m and m not in seen:
                seen.add(m)
                models_to_try.append(m)

        last_error = None
        for model_name in models_to_try:
            try:
                logger.info(f"[Gemini] Tentative avec {model_name}...")
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                reply = (response.text or '').strip()
                if reply:
                    logger.info(f"[Gemini] ✅ Succès avec {model_name}")
                    return reply
                else:
                    last_error = "Réponse vide"
                    logger.warning(f"[Gemini] {model_name} : réponse vide")
            except Exception as e:
                # Log complet avec type + message
                logger.warning(
                    f"[Gemini] {model_name} indisponible : "
                    f"{type(e).__name__} — {e}"
                )
                last_error = e
                continue

        # Aucun modèle n'a fonctionné
        logger.error(f"Tous les modèles ont échoué. Dernière erreur : {last_error}")
        return _fallback_busy(user, active_session=active_session)

    except Exception as e:
        logger.exception("Gemini API Error (hors boucle): %s", e)
        return _fallback_busy(user, active_session=active_session)