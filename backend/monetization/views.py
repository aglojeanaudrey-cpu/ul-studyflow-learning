from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import PromoCode, UnlockRequest, PlatformConfig, PaymentMethod
from .serializers import PromoCodeSerializer, UnlockRequestSerializer, PlatformConfigSerializer, PaymentMethodSerializer
from accounts.permissions import IsStaffOrSuperuser, IsSuperuserOnly
from notifications.utils import (
    notify_unlock_request_submitted,
    notify_unlock_request_approved,
    notify_unlock_request_rejected,
    notify_admins_new_unlock_request,
)

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
                applied_promo = promo.code

                # ⭐ CAS SPÉCIAL : code 100% (1 UE offerte)
                # Il ne s'applique qu'à UNE SEULE UE, pas au total
                if discount_percent >= 100:
                    # Réduire le nombre d'UE payantes à 1
                    # (prix d'1 UE standard, sans le pack)
                    subtotal = config.default_ue_price_fcfa
                else:
                    # Réduction classique (pourcentage sur le total)
                    discount_amount = round((subtotal * discount_percent) / 100)
                    subtotal = max(0, subtotal - discount_amount)

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

                # ⭐ Notification à l'étudiant (confirmation)
        try:
            notify_unlock_request_submitted(unlock_req)
        except Exception as e:
            print(f"[monetization] Erreur notif submit : {e}")

        # ⭐ Notification aux superusers (nouvelle demande à traiter)
        try:
            notify_admins_new_unlock_request(unlock_req)
        except Exception as e:
            print(f"[monetization] Erreur notif admins : {e}")

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

        # Accorder l'accès actif à toutes les UE demandées (validité : 6 mois et 10 jours)
        from courses.models import UE, UserUEAccess, compute_ue_expiration_date
        now = timezone.now()
        expires_at = compute_ue_expiration_date(now)
        for ue_id in unlock_req.ue_ids:
            ue = UE.objects.filter(id=ue_id).first()
            if ue:
                access, created = UserUEAccess.objects.get_or_create(
                    user=unlock_req.user,
                    ue=ue,
                    defaults={
                        'granted_by': actor.phone,
                        'status': 'active',
                        'granted_at': now,
                        'expires_at': expires_at
                    }
                )
                if not created:
                    access.status = 'active'
                    access.granted_by = actor.phone
                    access.granted_at = now
                    access.expires_at = expires_at
                    access.save()

        # ⭐ Valider le parrainage si l'étudiant a été parrainé
        try:
            from referrals.utils import validate_referral_if_applicable
            ue_code = unlock_req.ue_codes[0] if unlock_req.ue_codes else None
            validate_referral_if_applicable(unlock_req.user, ue_code=ue_code)
        except Exception as e:
            print(f"[monetization] Erreur validation parrainage : {e}")

        # ⭐ Notification à l'étudiant
        try:
            notify_unlock_request_approved(unlock_req)
        except Exception as e:
            print(f"[monetization] Erreur notif approve : {e}")

        # ⭐ Notification à l'étudiant
        try:
            notify_unlock_request_approved(unlock_req)
        except Exception as e:
            print(f"[monetization] Erreur notif approve : {e}")

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

        # ⭐ Notification à l'étudiant
        try:
            notify_unlock_request_rejected(unlock_req, reason=reason)
        except Exception as e:
            print(f"[monetization] Erreur notif reject : {e}")

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
        if 'activitiesRetentionDays' in data:
            try:
                val = int(data['activitiesRetentionDays'])
                config.activities_retention_days = max(1, min(3650, val))  # entre 1 jour et 10 ans
            except (ValueError, TypeError):
                pass
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


class PaymentMethodListView(APIView):
    """Liste publique des moyens de paiement actifs pour le déblocage et le marketing."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        methods = PaymentMethod.objects.filter(is_active=True).order_by('order', 'id')
        # Si aucun moyen de paiement n'a encore été créé, initialiser les moyens par défaut
        if not methods.exists() and not PaymentMethod.objects.exists():
            PaymentMethod.objects.create(
                id='pm_tmoney',
                name='T-Money Togo (*145#)',
                method_type='phone_account',
                account_number='+228 71 67 69 45',
                instructions="Composez *145# > Option 1 (Transfert) vers le numéro ci-dessous. Mentionnez votre nom en référence.",
                order=1,
                is_active=True
            )
            PaymentMethod.objects.create(
                id='pm_flooz',
                name='Moov Flooz Togo (*155#)',
                method_type='phone_account',
                account_number='+228 99 70 59 20',
                instructions="Composez *155# > Transfert d'argent vers le numéro ci-dessous. Conservez la référence de transaction SMS.",
                order=2,
                is_active=True
            )
            methods = PaymentMethod.objects.filter(is_active=True).order_by('order', 'id')

        return Response({'paymentMethods': PaymentMethodSerializer(methods, many=True).data})


class AdminPaymentMethodView(APIView):
    """Gestion des moyens de paiement (Superuser et Staff autorisé)."""
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        methods = PaymentMethod.objects.all().order_by('order', 'id')
        if not methods.exists():
            PaymentMethod.objects.create(
                id='pm_tmoney',
                name='T-Money Togo (*145#)',
                method_type='phone_account',
                account_number='+228 71 67 69 45',
                instructions="Composez *145# > Option 1 (Transfert) vers le numéro ci-dessous. Mentionnez votre nom en référence.",
                order=1,
                is_active=True
            )
            PaymentMethod.objects.create(
                id='pm_flooz',
                name='Moov Flooz Togo (*155#)',
                method_type='phone_account',
                account_number='+228 99 70 59 20',
                instructions="Composez *155# > Transfert d'argent vers le numéro ci-dessous. Conservez la référence de transaction SMS.",
                order=2,
                is_active=True
            )
            methods = PaymentMethod.objects.all().order_by('order', 'id')
        return Response({'paymentMethods': PaymentMethodSerializer(methods, many=True).data})

    def post(self, request):
        data = request.data
        name = str(data.get('name') or '').strip()
        if not name:
            return Response({'error': 'Le nom du moyen de paiement est requis.'}, status=status.HTTP_400_BAD_REQUEST)

        m_type = data.get('type') or data.get('method_type') or 'phone_account'
        if m_type not in ('phone_account', 'payment_link', 'qr_code', 'other'):
            m_type = 'phone_account'

        try:
            order_val = int(data.get('order') or (PaymentMethod.objects.count() + 1))
        except (ValueError, TypeError):
            order_val = 1

        pm = PaymentMethod.objects.create(
            name=name,
            method_type=m_type,
            account_number=str(data.get('accountNumber') or '').strip(),
            payment_url=str(data.get('paymentUrl') or '').strip() or None,
            qr_code_image=data.get('qrCodeImage') or None,
            logo_url=str(data.get('logoUrl') or '').strip() or None,
            instructions=str(data.get('instructions') or '').strip(),
            order=order_val,
            is_active=bool(data.get('isActive', True))
        )

        try:
            from audit.utils import log_audit
            log_audit(
                action='PAYMENT_METHOD_CREATE',
                resource=pm.id,
                details=f"Création moyen de paiement: {pm.name} ({pm.method_type})",
                user=request.user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True, 'paymentMethod': PaymentMethodSerializer(pm).data}, status=status.HTTP_201_CREATED)


class AdminPaymentMethodDetailView(APIView):
    """Mise à jour et suppression d'un moyen de paiement."""
    permission_classes = [IsStaffOrSuperuser]

    def put(self, request, pm_id):
        try:
            pm = PaymentMethod.objects.get(id=pm_id)
        except PaymentMethod.DoesNotExist:
            return Response({'error': 'Moyen de paiement introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'name' in data and str(data['name']).strip():
            pm.name = str(data['name']).strip()
        if 'type' in data or 'method_type' in data:
            m_type = data.get('type') or data.get('method_type')
            if m_type in ('phone_account', 'payment_link', 'qr_code', 'other'):
                pm.method_type = m_type
        if 'accountNumber' in data:
            pm.account_number = str(data['accountNumber'] or '').strip()
        if 'paymentUrl' in data:
            pm.payment_url = str(data['paymentUrl'] or '').strip() or None
        if 'qrCodeImage' in data:
            pm.qr_code_image = data['qrCodeImage'] or None
        if 'logoUrl' in data:
            pm.logo_url = str(data['logoUrl'] or '').strip() or None
        if 'instructions' in data:
            pm.instructions = str(data['instructions'] or '').strip()
        if 'order' in data:
            try:
                pm.order = int(data['order'])
            except (ValueError, TypeError):
                pass
        if 'isActive' in data:
            pm.is_active = bool(data['isActive'])

        pm.save()

        try:
            from audit.utils import log_audit
            log_audit(
                action='PAYMENT_METHOD_UPDATE',
                resource=pm.id,
                details=f"Mise à jour moyen de paiement: {pm.name}",
                user=request.user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True, 'paymentMethod': PaymentMethodSerializer(pm).data})

    def delete(self, request, pm_id):
        try:
            pm = PaymentMethod.objects.get(id=pm_id)
        except PaymentMethod.DoesNotExist:
            return Response({'error': 'Moyen de paiement introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        name = pm.name
        pm.delete()

        try:
            from audit.utils import log_audit
            log_audit(
                action='PAYMENT_METHOD_DELETE',
                resource=pm_id,
                details=f"Suppression moyen de paiement: {name}",
                user=request.user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True})


class AdminPaymentMethodToggleView(APIView):
    """Activation / Désactivation rapide d'un moyen de paiement."""
    permission_classes = [IsStaffOrSuperuser]

    def put(self, request, pm_id):
        try:
            pm = PaymentMethod.objects.get(id=pm_id)
        except PaymentMethod.DoesNotExist:
            return Response({'error': 'Moyen de paiement introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        pm.is_active = not pm.is_active
        pm.save()
        return Response({'success': True, 'isActive': pm.is_active})

