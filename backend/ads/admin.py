from django.contrib import admin
from .models import PopupTemplate, PopupCampaign, PopupView, PopupClick


@admin.register(PopupTemplate)
class PopupTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_system', 'created_at')
    list_filter = ('is_system',)
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at')


@admin.register(PopupCampaign)
class PopupCampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'popup_type', 'is_active', 'priority', 'views_count', 'clicks_count', 'created_at')
    list_filter = ('popup_type', 'is_active', 'target_audience', 'frequency')
    search_fields = ('title', 'message')
    readonly_fields = ('id', 'views_count', 'clicks_count', 'created_at')
    ordering = ('-priority', '-created_at')


@admin.register(PopupView)
class PopupViewAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'user_phone', 'page', 'viewed_at')
    list_filter = ('viewed_at',)
    search_fields = ('user_phone', 'page')
    readonly_fields = ('id', 'viewed_at')


@admin.register(PopupClick)
class PopupClickAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'user_phone', 'button_type', 'page', 'clicked_at')
    list_filter = ('button_type', 'clicked_at')
    search_fields = ('user_phone',)
    readonly_fields = ('id', 'clicked_at')