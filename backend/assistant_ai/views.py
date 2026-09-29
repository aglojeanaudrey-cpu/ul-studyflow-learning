from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .service import ask_pedagogical_assistant

class AiAskView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_ai_suspended:
            return Response({
                'error': "L'accès à l'assistance IA a été temporairement suspendu ou limité par l'administrateur. Veuillez contacter le support pédagogique UL Study Flow au +228 99 70 59 20 ou +228 71 67 69 45."
            }, status=status.HTTP_403_FORBIDDEN)

        message = request.data.get('message')
        if not message or not isinstance(message, str):
            return Response({'error': 'Message vide ou invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        history = request.data.get('history', [])
        context_session_id = request.data.get('contextSessionId')

        reply = ask_pedagogical_assistant(
            user=user,
            user_message=message,
            history=history,
            context_session_id=context_session_id
        )

        return Response({'reply': reply})
