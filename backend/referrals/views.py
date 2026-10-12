from django.db.models import Q, Count
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from accounts.permissions import IsStaffOrSuperuser, IsSuperuserOnly, require_admin_permission
from .models import ReferralCode, Referral, ReferralReward
from .serializers import (
    ReferralCodeSerializer,
    ReferralSerializer,
    ReferralRewardSerializer,
)
from .utils import get_or_create_referral_code


# =============================================================================
# VUES ÉTUDIANT
# =============================================================================

class MyReferralView(APIView):
    """Retourne les infos de parrainage de l'utilisateur connecté."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        code = get_or_create_referral_code(user)

        # Mes filleuls (en tant que parrain)
        my_referrals = Referral.objects.filter(referrer=user).select_related('referee').order_by('-created_at')

        # Mes récompenses
        my_rewards = ReferralReward.objects.filter(user=user).order_by('-granted_at')

        # Infos si je suis moi-même un filleul
        i_am_referee = Referral.objects.filter(referee=user).select_related('referrer').first()

        return Response({
            'code': ReferralCodeSerializer(code).data,
            'referrals': ReferralSerializer(my_referrals, many=True).data,
            'rewards': ReferralRewardSerializer(my_rewards, many=True).data,
            'iAmReferee': ReferralSerializer(i_am_referee).data if i_am_referee else None,
        })


# =============================================================================
# VUES ADMIN
# =============================================================================

class AdminReferralsListView(APIView):
    """Liste tous les parrainages avec filtres."""
    permission_classes = [require_admin_permission('users')]

    def get(self, request):
        qs = Referral.objects.select_related('referrer', 'referee').order_by('-created_at')

        # Filtres optionnels
        status_filter = request.GET.get('status')
        if status_filter and status_filter != 'ALL':
            qs = qs.filter(status=status_filter)

        search = request.GET.get('q', '').strip()
        if search:
            qs = qs.filter(
                Q(referrer__phone__icontains=search) |
                Q(referrer__first_name__icontains=search) |
                Q(referrer__last_name__icontains=search) |
                Q(referee__phone__icontains=search) |
                Q(referee__first_name__icontains=search) |
                Q(referee__last_name__icontains=search) |
                Q(referral_code__icontains=search)
            )

        return Response({
            'referrals': ReferralSerializer(qs[:500], many=True).data,
            'total': qs.count(),
        })


class AdminReferralsStatsView(APIView):
    """Statistiques globales du système de parrainage."""
    permission_classes = [require_admin_permission('users')]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timezone.timedelta(days=30)

        # Totaux
        total_referrals = Referral.objects.count()
        total_validated = Referral.objects.filter(status='validated').count()
        total_pending = Referral.objects.filter(status='pending').count()
        total_expired = Referral.objects.filter(status='expired').count()

        # Validés ce mois
        validated_this_month = Referral.objects.filter(
            status='validated',
            validated_at__gte=thirty_days_ago
        ).count()

        # Top parrains
        top_referrers = (
            ReferralCode.objects
            .filter(validated_referrals__gt=0)
            .select_related('user')
            .order_by('-validated_referrals')[:10]
        )
        top_referrers_data = [
            {
                'code': rc.code,
                'userName': f"{rc.user.first_name} {rc.user.last_name}",
                'userPhone': rc.user.display_phone or rc.user.phone,
                'department': rc.user.department,
                'level': rc.user.level,
                'validatedCount': rc.validated_referrals,
                'totalCount': rc.total_referrals,
            }
            for rc in top_referrers
        ]

        # Récompenses distribuées
        rewards_stats = (
            ReferralReward.objects
            .values('reward_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        rewards_list = [
            {'rewardType': r['reward_type'], 'count': r['count']}
            for r in rewards_stats
        ]

        # K-factor : moyenne de filleuls par parrain actif
        active_referrers = ReferralCode.objects.filter(validated_referrals__gt=0).count()
        k_factor = round(total_validated / active_referrers, 2) if active_referrers > 0 else 0.0

        # Taux de conversion
        conversion_rate = round((total_validated / total_referrals * 100), 2) if total_referrals > 0 else 0.0

        return Response({
            'totalReferrals': total_referrals,
            'totalValidated': total_validated,
            'totalPending': total_pending,
            'totalExpired': total_expired,
            'validatedThisMonth': validated_this_month,
            'conversionRate': conversion_rate,
            'kFactor': k_factor,
            'topReferrers': top_referrers_data,
            'rewardsDistributed': rewards_list,
        })


class AdminReferralForceValidateView(APIView):
    """Force la validation d'un parrainage (debug / correction manuelle)."""
    permission_classes = [IsSuperuserOnly]

    def post(self, request, referral_id):
        try:
            referral = Referral.objects.get(id=referral_id)
        except Referral.DoesNotExist:
            return Response({'error': 'Parrainage introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if referral.status == 'validated':
            return Response({'error': 'Ce parrainage est déjà validé.'}, status=status.HTTP_400_BAD_REQUEST)

        referral.status = 'validated'
        referral.validated_at = timezone.now()
        referral.validation_reason = f"Validation forcée par {request.user.phone}"
        referral.save()

        # Incrémenter le compteur du code
        from django.db.models import F
        ReferralCode.objects.filter(user=referral.referrer).update(
            validated_referrals=F('validated_referrals') + 1
        )

        # Vérifier les paliers
        try:
            from .utils import check_and_grant_milestones
            code = ReferralCode.objects.get(user=referral.referrer)
            check_and_grant_milestones(code)
        except Exception as e:
            print(f"[referrals] Erreur check paliers (force) : {e}")

        return Response({'success': True, 'referral': ReferralSerializer(referral).data})


class AdminReferralRejectView(APIView):
    """Rejette un parrainage (triche détectée)."""
    permission_classes = [require_admin_permission('users')]

    def post(self, request, referral_id):
        try:
            referral = Referral.objects.get(id=referral_id)
        except Referral.DoesNotExist:
            return Response({'error': 'Parrainage introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get('reason', '').strip() or 'Rejeté par administrateur'

        referral.status = 'rejected'
        referral.rejection_reason = reason
        referral.save()

        return Response({'success': True, 'referral': ReferralSerializer(referral).data})

class ActivateSponsorshipView(APIView):
    """
    Active manuellement une récompense 'sponsored_1m'.
    Une fois activée, la sponsorisation dure 30 jours et ne peut plus être annulée.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, reward_id):
        from .models import ReferralReward
        from .utils import activate_sponsorship

        try:
            reward = ReferralReward.objects.get(id=reward_id, user=request.user)
        except ReferralReward.DoesNotExist:
            return Response(
                {'error': 'Récompense introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if reward.reward_type != 'sponsored_1m':
            return Response(
                {'error': "Cette récompense n'est pas une sponsorisation."},
                status=status.HTTP_400_BAD_REQUEST
            )

        success, message = activate_sponsorship(reward)

        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'message': message,
            'reward': ReferralRewardSerializer(reward).data,
        })