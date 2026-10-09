from django.conf import settings as django_settings
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .throttles import LoginRateThrottle, RegisterRateThrottle
from .models import User, AuthToken
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .permissions import IsStaffOrSuperuser
from .utils import normalize_phone
from notifications.utils import (
    notify_welcome,
    notify_account_suspended,
    notify_account_reactivated,
    notify_ai_suspended,
    notify_ai_reactivated,
    notify_ue_access_granted,
    notify_ue_access_revoked,
)
from django.middleware.csrf import get_token

class GetCSRFTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({'csrfToken': get_token(request)})

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [RegisterRateThrottle]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        # ⭐ Récupérer le code de parrainage (optionnel)
        referral_code_used = (
            request.data.get('referralCode') or
            request.data.get('ref') or
            ''
        ).strip().upper()
        user = User.objects.create_user(
            phone=data['canonical_phone'],
            password=data['password'],
            first_name=data['firstName'].strip(),
            last_name=data['lastName'].strip(),
            department=data.get('department', 'FASEG'),
            program=data.get('program', 'Sciences Économiques'),
            level=data.get('level', 'L1'),
            role='USER',
            display_phone=data['display_phone']
        )

        # ⭐ Notification de bienvenue
        try:
            notify_welcome(user)
        except Exception as e:
            print(f"[accounts] Erreur notif welcome : {e}")

                # ⭐ Créer le code de parrainage de ce nouvel utilisateur
        try:
            from referrals.models import ReferralCode
            ReferralCode.objects.create(user=user)
        except Exception as e:
            print(f"[accounts] Erreur création code parrainage : {e}")

        # ⭐ Créer le parrainage si un code a été utilisé
        if referral_code_used:
            try:
                from referrals.utils import create_referral_from_code
                create_referral_from_code(user, referral_code_used)
            except Exception as e:
                print(f"[accounts] Erreur création parrainage : {e}")

        token = AuthToken.create_for_user(user)

        # Auto-grant access to UEs matching student's department or level
        try:
            from courses.models import UE, UserUEAccess
            matching_ues = UE.objects.filter(is_published=True, is_suspended=False).filter(
                Q(department__code__iexact=user.department) | Q(level=user.level)
            )
            granted_ues = list(matching_ues) if matching_ues.exists() else list(UE.objects.filter(is_published=True, is_suspended=False)[:2])
            for ue in granted_ues:
                UserUEAccess.objects.get_or_create(
                    user=user,
                    ue=ue,
                    defaults={
                        'granted_by': 'system_registration',
                        'status': 'active'
                    }
                )
        except Exception:
            pass

        # Audit log
        try:
            from audit.utils import log_audit
            log_audit(
                action='USER_REGISTER',
                resource='AUTH',
                details=f"Création compte {user.first_name} {user.last_name} ({user.phone})",
                user=user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        token = AuthToken.create_for_user(user)

        # ⭐ Plus de token dans le body — uniquement dans le cookie HttpOnly
        response = Response({
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

        self._set_auth_cookie(response, token.key)
        return response

    @staticmethod
    def _set_auth_cookie(response, token_key):
        """Helper centralisé pour poser le cookie de session."""
        response.set_cookie(
            'ulsf_session',
            token_key,
            httponly=True,               # 🔒 JS ne peut pas lire
            secure=not settings.DEBUG,   # 🔒 HTTPS en prod, HTTP en local
            samesite='Lax',              # 🛡️ anti-CSRF
            max_age=7 * 24 * 60 * 60,    # 7 jours
            path='/'
        )

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Identifiant et mot de passe requis.'}, status=status.HTTP_400_BAD_REQUEST)

        raw_id = (request.data.get('phone') or request.data.get('identifier') or request.data.get('email') or '').strip()
        password = request.data.get('password', '')

        if not raw_id or not password:
            return Response({'error': 'Identifiant et mot de passe requis.'}, status=status.HTTP_400_BAD_REQUEST)

        canonical, display, is_valid = normalize_phone(raw_id)
        raw_digits = ''.join(c for c in raw_id if c.isdigit())
        lower_id = raw_id.lower()

        user = None
        users_qs = User.objects.all()

        for u in users_qs:
            if u.email and u.email.lower() == lower_id:
                user = u
                break
            if canonical and u.phone == canonical:
                user = u
                break
            u_digits = ''.join(c for c in u.phone if c.isdigit())
            if raw_digits and u_digits == raw_digits:
                user = u
                break
            if u.role == 'SUPERUSER' and ('71676945' in raw_id or canonical == '+22871676945'):
                user = u
                break

        if not user or not user.check_password(password):
            return Response({'error': 'Identifiant ou mot de passe incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active:
            return Response({
                'error': 'Votre compte est désactivé. Veuillez contacter le support (+228 99 70 59 20 / 71 67 69 45).'
            }, status=status.HTTP_403_FORBIDDEN)

        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])

        try:
            from audit.utils import log_audit
            log_audit(
                action='USER_LOGIN',
                resource='AUTH',
                details=f"Connexion réussie de {user.first_name} {user.last_name}",
                user=user,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        token = AuthToken.create_for_user(user)

        # ⭐ Plus de token dans le body
        response = Response({
            'user': UserSerializer(user).data
        })

        response.set_cookie(
            'ulsf_session',
            token.key,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=7 * 24 * 60 * 60,
            path='/'
        )
        return response

class MeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({'user': None}, status=status.HTTP_200_OK)
        return Response({'user': UserSerializer(request.user).data})

class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]  # ⭐ AllowAny pour pouvoir logout même si token expiré

    def post(self, request):
        # 1. Supprimer le token de la DB
        if hasattr(request, 'auth') and request.auth:
            try:
                request.auth.delete()
            except Exception:
                pass

        # 2. Supprimer le cookie côté navigateur
        response = Response({'success': True})
        response.delete_cookie('ulsf_session', path='/')
        return response

class AdminUsersListView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request):
        users = User.objects.all().order_by('-created_at')
        return Response({'users': UserSerializer(users, many=True).data})

    def post(self, request):
        actor = request.user
        data = request.data
        phone = data.get('phone')
        first_name = data.get('firstName') or data.get('first_name')
        last_name = data.get('lastName') or data.get('last_name')
        password = data.get('password')

        if not phone or not first_name or not last_name or not password:
            return Response({'error': 'Téléphone, prénom, nom et mot de passe requis.'}, status=status.HTTP_400_BAD_REQUEST)

        canonical, display, is_valid = normalize_phone(phone)
        if not is_valid:
            return Response({'error': 'Numéro de téléphone invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(phone=canonical).exists():
            return Response({'error': 'Ce numéro de téléphone est déjà utilisé.'}, status=status.HTTP_400_BAD_REQUEST)

        role = data.get('role', 'USER')
        if role == 'SUPERUSER' and actor.role != 'SUPERUSER':
            return Response({'error': 'Seul le Super-Administrateur peut créer un autre Superuser.'}, status=status.HTTP_403_FORBIDDEN)

        admin_perms = data.get('adminPermissions') or data.get('admin_permissions')
        if not isinstance(admin_perms, list):
            admin_perms = ['dashboard', 'courses', 'progress'] if role == 'STAFF' else []

        new_user = User.objects.create_user(
            phone=canonical,
            password=password,
            display_phone=display,
            email=data.get('email') or None,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            department=data.get('department', 'FASEG'),
            program=data.get('program', 'Sciences Économiques'),
            level=data.get('level', 'L1'),
            role=role if role in ('USER', 'STAFF', 'SUPERUSER') else 'USER',
            is_sponsored=bool(data.get('isSponsored')) if actor.role == 'SUPERUSER' else False,
            is_ai_suspended=bool(data.get('isAiSuspended')) if actor.role == 'SUPERUSER' else False,
            admin_permissions=admin_perms if actor.role == 'SUPERUSER' else (['dashboard', 'courses', 'progress'] if role == 'STAFF' else [])
        )

        try:
            from audit.utils import log_audit
            log_audit(
                action='USER_CREATE',
                resource=new_user.id,
                details=f"Création utilisateur {new_user.phone} ({new_user.first_name} {new_user.last_name}) avec rôle {new_user.role}",
                user=actor,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True, 'user': UserSerializer(new_user).data}, status=status.HTTP_201_CREATED)


class AdminUserDetailView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def put(self, request, user_id):
        actor = request.user
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if actor.role == 'STAFF' and target_user.role == 'SUPERUSER':
            return Response({'error': 'Le personnel ne peut pas modifier un compte Super-Administrateur.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        if target_user.id == 'usr_super_1':
            role = data.get('role')
            if role and role != 'SUPERUSER':
                return Response({'error': 'Le Super-Administrateur principal ne peut pas être dégradé.'}, status=status.HTTP_400_BAD_REQUEST)

        first_name = data.get('firstName') or data.get('first_name')
        if first_name:
            target_user.first_name = first_name.strip()

        last_name = data.get('lastName') or data.get('last_name')
        if last_name:
            target_user.last_name = last_name.strip()

        if 'email' in data:
            target_user.email = data['email'].strip() if data['email'] else None

        if 'department' in data:
            target_user.department = data['department']

        if 'program' in data:
            target_user.program = data['program']

        if 'level' in data:
            target_user.level = data['level']

        phone = data.get('phone')
        if phone:
            canonical, display, is_valid = normalize_phone(phone)
            if is_valid and (canonical == target_user.phone or not User.objects.filter(phone=canonical).exclude(id=target_user.id).exists()):
                target_user.phone = canonical
                target_user.display_phone = display

                is_active = data.get('isActive')
        if is_active is not None and target_user.id != 'usr_super_1':
            was_active = target_user.is_active
            target_user.is_active = bool(is_active)

            # ⭐ Notification si changement de statut
            if was_active and not target_user.is_active:
                try:
                    notify_account_suspended(target_user)
                except Exception as e:
                    print(f"[accounts] Erreur notif suspend : {e}")
            elif not was_active and target_user.is_active:
                try:
                    notify_account_reactivated(target_user)
                except Exception as e:
                    print(f"[accounts] Erreur notif reactivate : {e}")

        role = data.get('role')
        if role and role in ('USER', 'STAFF', 'SUPERUSER'):
            if role == 'SUPERUSER' and actor.role != 'SUPERUSER':
                return Response({'error': 'Seul le Super-Administrateur peut attribuer le rôle Superuser.'}, status=status.HTTP_403_FORBIDDEN)
            if target_user.id != 'usr_super_1':
                target_user.role = role

        # Granular admin permissions for STAFF: Superuser only
        admin_perms = data.get('adminPermissions') if 'adminPermissions' in data else data.get('admin_permissions')
        if admin_perms is not None:
            if actor.role != 'SUPERUSER':
                return Response({'error': 'Seul le Super-Administrateur peut modifier les permissions administratives.'}, status=status.HTTP_403_FORBIDDEN)
            if isinstance(admin_perms, list):
                target_user.admin_permissions = admin_perms

        # Sponsoring: Superuser only
        is_sponsored = data.get('isSponsored')
        if is_sponsored is not None:
            if actor.role != 'SUPERUSER':
                return Response({'error': 'Seul le Super-Administrateur peut sponsoriser un compte pour un accès gratuit.'}, status=status.HTTP_403_FORBIDDEN)
            target_user.is_sponsored = bool(is_sponsored)

                # AI Suspension: Superuser only
        is_ai_suspended = data.get('isAiSuspended')
        if is_ai_suspended is not None:
            if actor.role != 'SUPERUSER':
                return Response({'error': 'Seul le Super-Administrateur peut limiter ou suspendre l\'accès à l\'IA.'}, status=status.HTTP_403_FORBIDDEN)

            was_ai_suspended = target_user.is_ai_suspended
            target_user.is_ai_suspended = bool(is_ai_suspended)

            # ⭐ Notification si changement d'état IA
            if not was_ai_suspended and target_user.is_ai_suspended:
                try:
                    notify_ai_suspended(target_user)
                except Exception as e:
                    print(f"[accounts] Erreur notif IA suspend : {e}")
            elif was_ai_suspended and not target_user.is_ai_suspended:
                try:
                    notify_ai_reactivated(target_user)
                except Exception as e:
                    print(f"[accounts] Erreur notif IA reactivate : {e}")

        # Password update
        password = data.get('password')
        if password and len(str(password).strip()) >= 6:
            target_user.set_password(str(password).strip())

        target_user.save()

        try:
            from audit.utils import log_audit
            log_audit(
                action='USER_UPDATE',
                resource=target_user.id,
                details=f"Mise à jour compte: {target_user.phone} ({target_user.role}), Actif: {target_user.is_active}, Sponsorisé: {target_user.is_sponsored}",
                user=actor,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True, 'user': UserSerializer(target_user).data})

    def delete(self, request, user_id):
        actor = request.user
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if target_user.id == 'usr_super_1':
            return Response({'error': 'Impossible de supprimer le Super-Administrateur principal.'}, status=status.HTTP_400_BAD_REQUEST)

        if target_user.role == 'SUPERUSER' and actor.role != 'SUPERUSER':
            return Response({'error': 'Le personnel ne peut pas supprimer un Super-Administrateur.'}, status=status.HTTP_403_FORBIDDEN)

        user_desc = f"{target_user.phone} ({target_user.first_name} {target_user.last_name})"
        target_user.delete()

        try:
            from audit.utils import log_audit
            log_audit(
                action='USER_DELETE',
                resource=user_id,
                details=f"Suppression utilisateur {user_desc}",
                user=actor,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True})


    permission_classes = [IsStaffOrSuperuser]

    def post(self, request, user_id):
        actor = request.user
        ue_id = request.data.get('ueId')
        action = request.data.get('action') # 'grant' | 'revoke'

        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        from courses.models import UE, UserUEAccess
        try:
            ue = UE.objects.get(id=ue_id)
        except UE.DoesNotExist:
            return Response({'error': 'UE introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        access, created = UserUEAccess.objects.get_or_create(
            user=target_user,
            ue=ue,
            defaults={
                'granted_by': actor.phone,
                'status': 'active' if action == 'grant' else 'revoked'
            }
        )

        if not created:
            access.status = 'active' if action == 'grant' else 'revoked'
            access.granted_by = actor.phone
            access.save()

        try:
            from audit.utils import log_audit
            log_audit(
                action='ACCESS_CHANGE',
                resource=target_user.id,
                details=f"{'Attribution' if action == 'grant' else 'Révocation'} de l'UE {ue.code} pour {target_user.phone}",
                user=actor,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        return Response({'success': True})


class AdminUserAccessView(APIView):
    permission_classes = [IsStaffOrSuperuser]

    def get(self, request, user_id):
        """Retourne la liste des UE actuellement accordées (status='active') à cet utilisateur."""
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        from courses.models import UserUEAccess
        granted_ids = list(
            UserUEAccess.objects
            .filter(user=target_user, status='active')
            .values_list('ue_id', flat=True)
        )
        return Response({
            'success': True,
            'userId': target_user.id,
            'grantedUeIds': granted_ids,
        })

    def post(self, request, user_id):
        actor = request.user
        ue_id = request.data.get('ueId')
        action = request.data.get('action')  # 'grant' | 'revoke'

        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        from courses.models import UE, UserUEAccess
        try:
            ue = UE.objects.get(id=ue_id)
        except UE.DoesNotExist:
            return Response({'error': 'UE introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        access, created = UserUEAccess.objects.get_or_create(
            user=target_user,
            ue=ue,
            defaults={
                'granted_by': actor.phone,
                'status': 'active' if action == 'grant' else 'revoked'
            }
        )
        if not created:
            access.status = 'active' if action == 'grant' else 'revoked'
            access.granted_by = actor.phone
            access.save()

        # ⭐ Notification à l'étudiant
        try:
            if action == 'grant':
                notify_ue_access_granted(target_user, ue, granted_by=actor)
            else:
                notify_ue_access_revoked(target_user, ue)
        except Exception as e:
            print(f"[accounts] Erreur notif accès UE : {e}")

        # Audit log
        try:
            from audit.utils import log_audit
            log_audit(
                action='ACCESS_CHANGE',
                resource=target_user.id,
                details=f"{'Attribution' if action == 'grant' else 'Révocation'} de l'UE {ue.code} pour {target_user.phone}",
                user=actor,
                ip=request.META.get('REMOTE_ADDR')
            )
        except Exception:
            pass

        # ⭐ Retourne l'état à jour pour éviter un refetch côté front
        granted_ids = list(
            UserUEAccess.objects
            .filter(user=target_user, status='active')
            .values_list('ue_id', flat=True)
        )
        return Response({
            'success': True,
            'userId': target_user.id,
            'ueId': ue_id,
            'status': access.status,
            'grantedUeIds': granted_ids,
        })