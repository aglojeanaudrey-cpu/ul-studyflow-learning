from rest_framework import serializers
from .models import ReferralCode, Referral, ReferralReward


class ReferralCodeSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source='user.id', read_only=True)
    userName = serializers.SerializerMethodField()
    nextMilestone = serializers.SerializerMethodField()

    class Meta:
        model = ReferralCode
        fields = [
            'id', 'code', 'userId', 'userName',
            'total_referrals', 'validated_referrals',
            'nextMilestone', 'created_at',
        ]

    def get_userName(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_nextMilestone(self, obj):
        return obj.get_next_milestone()


class ReferralSerializer(serializers.ModelSerializer):
    referrerName = serializers.SerializerMethodField()
    referrerPhone = serializers.SerializerMethodField()
    refereeName = serializers.SerializerMethodField()
    refereePhone = serializers.SerializerMethodField()

    class Meta:
        model = Referral
        fields = [
            'id', 'referrer', 'referee', 'referral_code',
            'referrerName', 'referrerPhone', 'refereeName', 'refereePhone',
            'status', 'created_at', 'expires_at', 'validated_at',
            'rejection_reason', 'validation_reason',
        ]

    def get_referrerName(self, obj):
        return f"{obj.referrer.first_name} {obj.referrer.last_name}" if obj.referrer else ''

    def get_referrerPhone(self, obj):
        return obj.referrer.display_phone or obj.referrer.phone if obj.referrer else ''

    def get_refereeName(self, obj):
        return f"{obj.referee.first_name} {obj.referee.last_name}" if obj.referee else ''

    def get_refereePhone(self, obj):
        return obj.referee.display_phone or obj.referee.phone if obj.referee else ''


class ReferralRewardSerializer(serializers.ModelSerializer):
    rewardLabel = serializers.CharField(source='get_reward_type_display', read_only=True)
    isSponsorshipActive = serializers.SerializerMethodField()
    daysRemainingSponsorship = serializers.SerializerMethodField()

    class Meta:
        model = ReferralReward
        fields = [
            'id', 'reward_type', 'rewardLabel', 'milestone',
            'promo_code', 'granted_at', 'expires_at',
            'is_used', 'used_at',
            # ⭐ Sponsorisation
            'is_activated', 'activated_at', 'sponsorship_expires_at',
            'isSponsorshipActive', 'daysRemainingSponsorship',
        ]

    def get_isSponsorshipActive(self, obj):
        return obj.is_sponsorship_active

    def get_daysRemainingSponsorship(self, obj):
        return obj.days_remaining_sponsorship