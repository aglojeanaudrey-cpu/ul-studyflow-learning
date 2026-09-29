from rest_framework import serializers
from .models import PromoCode, UnlockRequest, PlatformConfig

class PromoCodeSerializer(serializers.ModelSerializer):
    discountPercent = serializers.IntegerField(source='discount_percent')
    applicableTo = serializers.CharField(source='applicable_to')
    isActive = serializers.BooleanField(source='is_active')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    createdBy = serializers.CharField(source='created_by', required=False, allow_blank=True)

    class Meta:
        model = PromoCode
        fields = ['id', 'code', 'discountPercent', 'applicableTo', 'isActive', 'createdAt', 'createdBy']


class UnlockRequestSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source='user_id')
    userName = serializers.CharField(source='user_name')
    userPhone = serializers.CharField(source='user_phone')
    ueIds = serializers.JSONField(source='ue_ids')
    ueCodes = serializers.JSONField(source='ue_codes')
    promoCode = serializers.CharField(source='promo_code', required=False, allow_null=True)
    discountPercent = serializers.IntegerField(source='discount_percent', required=False, allow_null=True)
    subtotalFcfa = serializers.IntegerField(source='subtotal_fcfa')
    transactionFeeFcfa = serializers.IntegerField(source='transaction_fee_fcfa')
    totalFcfa = serializers.IntegerField(source='total_fcfa')
    paymentMethod = serializers.CharField(source='payment_method')
    createdAt = serializers.DateTimeField(source='created_at')
    reviewedAt = serializers.DateTimeField(source='reviewed_at', required=False, allow_null=True)
    reviewedBy = serializers.CharField(source='reviewed_by', required=False, allow_blank=True)

    class Meta:
        model = UnlockRequest
        fields = [
            'id', 'userId', 'userName', 'userPhone', 'ueIds', 'ueCodes',
            'promoCode', 'discountPercent', 'subtotalFcfa', 'transactionFeeFcfa',
            'totalFcfa', 'status', 'paymentMethod', 'notes', 'createdAt',
            'reviewedAt', 'reviewedBy'
        ]


class PlatformConfigSerializer(serializers.ModelSerializer):
    defaultUePriceFcfa = serializers.IntegerField(source='default_ue_price_fcfa')
    discountedUePriceFcfa = serializers.IntegerField(source='discounted_ue_price_fcfa', required=False)
    onlineAssistancePerHourFcfa = serializers.IntegerField(source='online_assistance_per_hour_fcfa')
    inPersonAssistancePerHourFcfa = serializers.IntegerField(source='in_person_assistance_per_hour_fcfa', required=False)
    firstChapterFreeEnabled = serializers.BooleanField(source='first_chapter_free_enabled')
    allowSelfRegistration = serializers.BooleanField(source='allow_self_registration')
    universityName = serializers.CharField(source='university_name')
    academicYearCurrent = serializers.CharField(source='academic_year_current')
    contactPhones = serializers.JSONField(source='contact_phones')
    contactEmail = serializers.EmailField(source='contact_email')

    class Meta:
        model = PlatformConfig
        fields = [
            'defaultUePriceFcfa', 'discountedUePriceFcfa', 'onlineAssistancePerHourFcfa',
            'inPersonAssistancePerHourFcfa', 'firstChapterFreeEnabled', 'allowSelfRegistration',
            'universityName', 'academicYearCurrent', 'contactPhones', 'contactEmail'
        ]
