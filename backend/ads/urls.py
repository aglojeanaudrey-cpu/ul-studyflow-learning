from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('popups/active', views.ActivePopupsView.as_view(), name='api-popups-active'),
    path('popups/<str:popup_id>/view', views.TrackPopupViewView.as_view(), name='api-popup-track-view'),
    path('popups/<str:popup_id>/click', views.TrackPopupClickView.as_view(), name='api-popup-track-click'),

    # Admin - Campagnes
    path('admin/popups', views.AdminPopupsListView.as_view(), name='api-admin-popups-list'),
    path('admin/popups/<str:popup_id>', views.AdminPopupDetailView.as_view(), name='api-admin-popup-detail'),
    path('admin/popups/<str:popup_id>/toggle', views.AdminPopupToggleView.as_view(), name='api-admin-popup-toggle'),
    path('admin/popups/<str:popup_id>/stats', views.AdminPopupStatsView.as_view(), name='api-admin-popup-stats'),
    path('admin/popups/<str:popup_id>/viewers', views.AdminPopupViewersView.as_view(), name='api-admin-popup-viewers'),

    # Admin - Templates
    path('admin/popup-templates', views.AdminPopupTemplatesView.as_view(), name='api-admin-popup-templates-list'),
    path('admin/popup-templates/<str:template_id>', views.AdminPopupTemplateDetailView.as_view(), name='api-admin-popup-template-detail'),
]