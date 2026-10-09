from django.contrib import admin
from .models import ReferralCode, Referral, ReferralReward


@admin.register(ReferralCode)
class ReferralCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'user', 'total_referrals', 'validated_referrals', 'created_at')
    search_fields = ('code', 'user__phone', 'user__first_name', 'user__last_name')
    readonly_fields = ('id', 'created_at')
    ordering = ('-validated_referrals',)


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ('referrer', 'referee', 'referral_code', 'status', 'created_at', 'expires_at')
    list_filter = ('status', 'created_at')
    search_fields = ('referrer__phone', 'referee__phone', 'referral_code')
    readonly_fields = ('id', 'created_at', 'expires_at')
    ordering = ('-created_at',)


@admin.register(ReferralReward)
class ReferralRewardAdmin(admin.ModelAdmin):
    list_display = ('user', 'reward_type', 'milestone', 'promo_code', 'granted_at', 'is_used')
    list_filter = ('reward_type', 'is_used', 'granted_at')
    search_fields = ('user__phone', 'promo_code')
    readonly_fields = ('id', 'granted_at')
    ordering = ('-granted_at',)