from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import PromoCode, UnlockRequest, PlatformConfig
from .serializers import PromoCodeSerializer, UnlockRequestSerializer, PlatformConfigSerializer
from accounts.permissions import IsStaffOrSuperuser, IsSuperuserOnly

class ValidatePromoCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, code):
        clean_code = code.strip().upper()
        promo = PromoCode.objects.filter(code=clean_code, is_active=True).first()

        if not promo:
            return Response({'valid': False, 'error': 'Code promo invalide ou expiré.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'valid': True,
            'code': promo.code,
            'discountPercent': promo.discount_percent,
            'applicableTo': promo.applicable_to
        })


class SubmitUnlockRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        nom = request.data.get('nom', '').strip()
        prenom = request.data.get('prenom', '').strip()
        numero = request.data.get('numero', '').strip()
        ue_ids = request.data.get('ueIds', [])
        promo_code_str = request.data.get('promoCode', '').strip()
        payment_method = request.data.get('paymentMethod', 'Mix Togo / Flooz Togo')
        notes = request.data.get('notes', '')

        if not ue_ids or not isinstance(ue_ids, list):
            return Response({'error': 'Veuillez sélectionner au moins une UE à débloquer.'}, status=status.HTTP_400_BAD_REQUEST)

        from courses.models import UE
        selected_ues = list(UE.objects.filter(id__in=ue_ids))
        if not selected_ues:
            return Response({'error': 'UE sélectionnées invalides.'}, status=status.HTTP_400_BAD_REQUEST)

        config = PlatformConfig.get_solo()

        # Tarification : 500 FCFA l'UE, 300 FCFA si 3 UE ou plus
        unit_price = config.discounted_ue_price_fcfa if len(selected_ues) >= 3 else config.default_ue_price_fcfa
        subtotal = len(selected_ues) * unit_price
        discount_percent = 0

        applied_promo = None
        if promo_code_str:
            clean_code = promo_code_str.strip().upper()
            promo = PromoCode.objects.filter(code=clean_code, is_active=True).first()
            if promo and promo.applicable_to in ('all', 'ue_unlock'):
                discount_percent = promo.discount_percent
                discount_amount = round((subtotal * discount_percent) / 100)
                subtotal = max(0, subtotal - discount_amount)
                applied_promo = promo.code

        transaction_fee = 100
        total_fcfa = subtotal + transaction_fee

        user_name = f"{prenom or user.first_name} {nom or user.last_name}".strip()
        user_phone = numero or user.display_phone or user.phone

        unlock_req = UnlockRequest.objects.create(
            user=user,
            user_name=user_name,
            user_phone=user_phone,
            ue_ids=[u.id for u in selected_ues],
            ue_codes=[u.code for u in selected_ues],
            promo_code=applied_promo,
            discount_percent=discount_percent if discount_percent > 0 else None,
            subtotal_fcfa=subtotal,
            transaction_fee_fcfa=transaction_fee,
            total_fcfa=total_fcfa,
            status='pending',
            payment_method=payment_method,
            notes=notes,
            created_at=timezone.now()
        )

        try:
            from audit.utils import log_audit
            log_audit(
                action='UNLOCK_REQUEST',
                resource=unlock_req.id,
                details=f"Demande déblocage ({', '.join(unlock_req.ue_codes)}) pour {unlock_req.user_name} - Total: {total_fcfa} FCFA",
                user=user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({
            'success': True,
            'request': UnlockRequestSerializer(unlock_req).data,
            'instructions': {
                'message': f"Veuillez effectuer votre dépôt de {total_fcfa} FCFA sur l'un des numéros ci-dessous. L'administration activera vos accès dans les prochaines 12h.",
                'mixTogo': "+228 71 67 69 45",
                'floozTogo': "+228 99 70 59 20"
            }
        })


class MyUnlockRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reqs = UnlockRequest.objects.filter(user=request.user).order_by('-created_at')
        return Response({'requests': UnlockRequestSerializer(reqs, many=True).data})


class AdminUnlockRequestsView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        reqs = UnlockRequest.objects.all().order_by('-created_at')
        return Response({'requests': UnlockRequestSerializer(reqs, many=True).data})


class AdminApproveUnlockRequestView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def post(self, request, req_id):
        actor = request.user
        try:
            unlock_req = UnlockRequest.objects.get(id=req_id)
        except UnlockRequest.DoesNotExist:
            return Response({'error': 'Demande introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        unlock_req.status = 'approved'
        unlock_req.reviewed_at = timezone.now()
        unlock_req.reviewed_by = actor.phone
        unlock_req.save()

        # Accorder l'accès actif à toutes les UE demandées
        from courses.models import UE, UserUEAccess
        for ue_id in unlock_req.ue_ids:
            ue = UE.objects.filter(id=ue_id).first()
            if ue:
                access, _ = UserUEAccess.objects.get_or_create(
                    user=unlock_req.user,
                    ue=ue,
                    defaults={'granted_by': actor.phone, 'status': 'active'}
                )
                access.status = 'active'
                access.granted_by = actor.phone
                access.save()

        try:
            from audit.utils import log_audit
            log_audit(
                action='UNLOCK_APPROVE',
                resource=unlock_req.id,
                details=f"Demande approuvée pour {unlock_req.user_name} - Accès accordé à {', '.join(unlock_req.ue_codes)}",
                user=actor,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True, 'request': UnlockRequestSerializer(unlock_req).data})


class AdminRejectUnlockRequestView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def post(self, request, req_id):
        actor = request.user
        reason = request.data.get('reason', '')

        try:
            unlock_req = UnlockRequest.objects.get(id=req_id)
        except UnlockRequest.DoesNotExist:
            return Response({'error': 'Demande introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        unlock_req.status = 'rejected'
        unlock_req.reviewed_at = timezone.now()
        unlock_req.reviewed_by = actor.phone
        if reason:
            prefix = f"{unlock_req.notes} - " if unlock_req.notes else ""
            unlock_req.notes = f"{prefix}Refusé : {reason}"
        unlock_req.save()

        return Response({'success': True, 'request': UnlockRequestSerializer(unlock_req).data})


class AdminPromoCodesView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsStaffOrSuperuser()]
        return [IsSuperuserOnly()]

    def get(self, request):
        promos = PromoCode.objects.all().order_by('-created_at')
        return Response({'promoCodes': PromoCodeSerializer(promos, many=True).data})

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        discount_percent = request.data.get('discountPercent')
        applicable_to = request.data.get('applicableTo', 'all')

        if not code or discount_percent is None:
            return Response({'error': 'Code et pourcentage de réduction requis.'}, status=status.HTTP_400_BAD_REQUEST)

        if PromoCode.objects.filter(code=code).exists():
            return Response({'error': 'Ce code promo existe déjà.'}, status=status.HTTP_400_BAD_REQUEST)

        promo = PromoCode.objects.create(
            code=code,
            discount_percent=max(1, min(100, int(discount_percent))),
            applicable_to=applicable_to,
            is_active=True,
            created_by=request.user.phone
        )

        return Response({'success': True, 'promoCode': PromoCodeSerializer(promo).data})


class AdminPromoCodeToggleView(APIView):
    permission_classes = [IsSuperuserOnly]

    def put(self, request, promo_id):
        try:
            promo = PromoCode.objects.get(id=promo_id)
        except PromoCode.DoesNotExist:
            return Response({'error': 'Code promo introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        promo.is_active = not promo.is_active
        promo.save()
        return Response({'success': True, 'isActive': promo.is_active})


class AdminPromoCodeDeleteView(APIView):
    permission_classes = [IsSuperuserOnly]

    def delete(self, request, promo_id):
        try:
            promo = PromoCode.objects.get(id=promo_id)
        except PromoCode.DoesNotExist:
            return Response({'error': 'Code promo introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        promo.delete()
        return Response({'success': True})


class AdminConfigView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsStaffOrSuperuser()]
        return [IsSuperuserOnly()]

    def get(self, request):
        config = PlatformConfig.get_solo()
        return Response({'config': PlatformConfigSerializer(config).data})

    def put(self, request):
        config = PlatformConfig.get_solo()
        data = request.data

        if 'defaultUePriceFcfa' in data: config.default_ue_price_fcfa = int(data['defaultUePriceFcfa'])
        if 'discountedUePriceFcfa' in data: config.discounted_ue_price_fcfa = int(data['discountedUePriceFcfa'])
        if 'onlineAssistancePerHourFcfa' in data: config.online_assistance_per_hour_fcfa = int(data['onlineAssistancePerHourFcfa'])
        if 'inPersonAssistancePerHourFcfa' in data: config.in_person_assistance_per_hour_fcfa = int(data['inPersonAssistancePerHourFcfa'])
        if 'firstChapterFreeEnabled' in data: config.first_chapter_free_enabled = bool(data['firstChapterFreeEnabled'])
        if 'allowSelfRegistration' in data: config.allow_self_registration = bool(data['allowSelfRegistration'])
        if 'universityName' in data: config.university_name = data['universityName']
        if 'academicYearCurrent' in data: config.academic_year_current = data['academicYearCurrent']
        if 'contactPhones' in data: config.contact_phones = data['contactPhones']
        if 'contactEmail' in data: config.contact_email = data['contactEmail']
        config.save()

        try:
            from audit.utils import log_audit
            log_audit(
                action='CONFIG_UPDATE',
                resource='PLATFORM',
                details="Mise à jour des tarifs et de la configuration générale",
                user=request.user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True, 'config': PlatformConfigSerializer(config).data})
