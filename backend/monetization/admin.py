from django.contrib import admin
from .models import PromoCode, UnlockRequest, PlatformConfig

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percent', 'applicable_to', 'is_active', 'created_at', 'created_by')
    list_filter = ('is_active', 'applicable_to')
    search_fields = ('code',)


@admin.register(UnlockRequest)
class UnlockRequestAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'user_phone', 'status', 'total_fcfa', 'created_at', 'reviewed_by')
    list_filter = ('status', 'payment_method')
    search_fields = ('user_name', 'user_phone', 'promo_code')
    readonly_fields = ('created_at',)


@admin.register(PlatformConfig)
class PlatformConfigAdmin(admin.ModelAdmin):
    list_display = ('university_name', 'academic_year_current', 'default_ue_price_fcfa', 'discounted_ue_price_fcfa')
