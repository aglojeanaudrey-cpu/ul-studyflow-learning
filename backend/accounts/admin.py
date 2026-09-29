from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, AuthToken

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('phone', 'first_name', 'last_name', 'role', 'department', 'level', 'is_active', 'is_sponsored', 'is_ai_suspended', 'created_at')
    list_filter = ('role', 'level', 'is_active', 'is_sponsored', 'is_ai_suspended', 'department')
    search_fields = ('phone', 'display_phone', 'first_name', 'last_name', 'email')
    ordering = ('-created_at',)

    fieldsets = (
        ('Identifiants & Contact', {
            'fields': ('id', 'phone', 'display_phone', 'email', 'password')
        }),
        ('Informations Personnelles', {
            'fields': ('first_name', 'last_name', 'department', 'program', 'level')
        }),
        ('Rôles & Permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Options Pédagogiques & Privilèges', {
            'fields': ('is_sponsored', 'is_ai_suspended')
        }),
        ('Dates Importantes', {
            'fields': ('created_at', 'last_login_at')
        }),
    )

    readonly_fields = ('id', 'created_at', 'last_login_at')

    actions = ['activate_users', 'deactivate_users', 'grant_sponsorship', 'revoke_sponsorship']

    @admin.action(description="Activer les comptes sélectionnés")
    def activate_users(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description="Désactiver les comptes sélectionnés")
    def deactivate_users(self, request, queryset):
        queryset.exclude(id='usr_super_1').update(is_active=False)

    @admin.action(description="Accorder le parrainage (Accès gratuit à toutes les UE)")
    def grant_sponsorship(self, request, queryset):
        queryset.update(is_sponsored=True)

    @admin.action(description="Retirer le parrainage")
    def revoke_sponsorship(self, request, queryset):
        queryset.update(is_sponsored=False)


@admin.register(AuthToken)
class AuthTokenAdmin(admin.ModelAdmin):
    list_display = ('key', 'user', 'created_at', 'expires_at')
    search_fields = ('key', 'user__phone', 'user__first_name', 'user__last_name')
    readonly_fields = ('key', 'user', 'created_at', 'expires_at')
