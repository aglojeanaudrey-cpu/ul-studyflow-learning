from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .service import ask_pedagogical_assistant, _support_message_suspended


class AiAskView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        # Suspension : message centralisé (plus de numéro en dur)
        if user.is_ai_suspended:
            return Response(
                {'error': _support_message_suspended()},
                status=status.HTTP_403_FORBIDDEN,
            )

        message = request.data.get('message')
        if not message or not isinstance(message, str):
            return Response(
                {'error': 'Message vide ou invalide.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        history = request.data.get('history', [])
        if not isinstance(history, list):
            history = []

        context_session_id = request.data.get('contextSessionId')
        context_ue_id = request.data.get('contextUeId')

        try:
            reply = ask_pedagogical_assistant(
                user=user,
                user_message=message,
                history=history,
                context_session_id=context_session_id,
                context_ue_id=context_ue_id,
            )
        except Exception as e:
            # Sécurité : ne jamais renvoyer une stacktrace au front
            import logging
            logging.getLogger(__name__).exception("AiAskView error: %s", e)
            return Response(
                {'error': "Une erreur est survenue lors du traitement. "
                          "Veuillez réessayer dans un instant."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({'reply': reply})

from .service import _get_user_ues  # ⭐ importe le helper existant


class AiAvailableUesView(APIView):
    """
    Liste les UE débloquées pour l'utilisateur connecté.
    Utilisé par le sélecteur d'UE de l'assistant IA.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        ues = _get_user_ues(user)

        data = []
        for ue in ues:
            sessions_count = ue.sessions.filter(
                is_published=True, is_suspended=False
            ).count()
            data.append({
                'id': ue.id,
                'code': ue.code,
                'title': ue.title,
                'level': ue.level,
                'semester': ue.semester,
                'department': ue.department.name if ue.department else None,
                'sessionsCount': sessions_count,
            })

        return Response({
            'ues': data,
            'count': len(data),
        })
