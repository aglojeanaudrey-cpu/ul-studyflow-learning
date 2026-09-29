from rest_framework import serializers
from .models import User
from .utils import normalize_phone

class UserSerializer(serializers.ModelSerializer):
    displayPhone = serializers.CharField(source='display_phone', read_only=True)
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    isActive = serializers.BooleanField(source='is_active', read_only=True)
    isSponsored = serializers.BooleanField(source='is_sponsored', read_only=True)
    isAiSuspended = serializers.BooleanField(source='is_ai_suspended', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    lastLoginAt = serializers.DateTimeField(source='last_login_at', read_only=True)
    accessCount = serializers.SerializerMethodField()
    unlockedUeIds = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'phone', 'displayPhone', 'email', 'firstName', 'lastName',
            'department', 'program', 'level', 'role', 'isActive', 'isSponsored',
            'isAiSuspended', 'createdAt', 'lastLoginAt', 'accessCount', 'unlockedUeIds'
        ]

    def get_accessCount(self, obj):
        if hasattr(obj, 'ue_accesses'):
            return obj.ue_accesses.filter(status='active').count()
        return 0

    def get_unlockedUeIds(self, obj):
        if hasattr(obj, 'ue_accesses'):
            return list(obj.ue_accesses.filter(status='active').values_list('ue_id', flat=True))
        return []


class RegisterSerializer(serializers.Serializer):
    phone = serializers.CharField(required=True)
    firstName = serializers.CharField(required=True)
    lastName = serializers.CharField(required=True)
    password = serializers.CharField(required=True, min_length=6, write_only=True)
    confirmPassword = serializers.CharField(required=False, write_only=True)
    department = serializers.CharField(required=False, default='FASEG')
    program = serializers.CharField(required=False, default='Sciences Économiques')
    level = serializers.CharField(required=False, default='L1')

    def validate(self, attrs):
        pw = attrs.get('password')
        cpw = attrs.get('confirmPassword')
        if cpw and pw != cpw:
            raise serializers.ValidationError({"confirmPassword": "Les deux mots de passe ne correspondent pas."})

        canonical, display, is_valid = normalize_phone(attrs['phone'])
        if not is_valid:
            raise serializers.ValidationError({"phone": "Format de numéro invalide (Ex: 90 12 34 56 ou +228 99 70 59 20)."})

        if User.objects.filter(phone=canonical).exists():
            raise serializers.ValidationError({"phone": "Ce numéro de téléphone possède déjà un compte UL STUDY FLOW."})

        attrs['canonical_phone'] = canonical
        attrs['display_phone'] = display
        return attrs


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(required=False, allow_blank=True)
    identifier = serializers.CharField(required=False, allow_blank=True)
    email = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=True, write_only=True)


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name', required=False)
    lastName = serializers.CharField(source='last_name', required=False)
    phone = serializers.CharField(required=False)
    displayPhone = serializers.CharField(source='display_phone', required=False)
    email = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    department = serializers.CharField(required=False)
    program = serializers.CharField(required=False)
    level = serializers.CharField(required=False)
    role = serializers.CharField(required=False)
    isActive = serializers.BooleanField(source='is_active', required=False)
    isSponsored = serializers.BooleanField(source='is_sponsored', required=False)
    isAiSuspended = serializers.BooleanField(source='is_ai_suspended', required=False)
    password = serializers.CharField(required=False, write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            'id', 'phone', 'displayPhone', 'email', 'firstName', 'lastName',
            'department', 'program', 'level', 'role', 'isActive', 'isSponsored',
            'isAiSuspended', 'password'
        ]
