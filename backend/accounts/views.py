from django.db.models import Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import User, AuthToken
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .permissions import IsStaffOrSuperuser
from .utils import normalize_phone

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            err_msg = first_err[0] if isinstance(first_err, list) else str(first_err)
            return Response({'error': err_msg}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
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
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

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

        # Find user by email, canonical phone, raw digits, or special superuser phones
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

        # Audit log
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
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'user': UserSerializer(request.user).data})


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
            target_user.is_active = bool(is_active)

        role = data.get('role')
        if role and role in ('USER', 'STAFF', 'SUPERUSER'):
            if role == 'SUPERUSER' and actor.role != 'SUPERUSER':
                return Response({'error': 'Seul le Super-Administrateur peut attribuer le rôle Superuser.'}, status=status.HTTP_403_FORBIDDEN)
            if target_user.id != 'usr_super_1':
                target_user.role = role

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
            target_user.is_ai_suspended = bool(is_ai_suspended)

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


class AdminUserAccessView(APIView):
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
