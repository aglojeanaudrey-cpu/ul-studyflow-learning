from django.urls import path
from . import views

urlpatterns = [
    # Étudiant
    path('referrals/me', views.MyReferralView.as_view(), name='api-referrals-me'),
    path('referrals/rewards/<str:reward_id>/activate', views.ActivateSponsorshipView.as_view(), name='api-referral-activate-sponsorship'),
    # Admin
    path('admin/referrals', views.AdminReferralsListView.as_view(), name='api-admin-referrals-list'),
    path('admin/referrals/stats', views.AdminReferralsStatsView.as_view(), name='api-admin-referrals-stats'),
    path('admin/referrals/<str:referral_id>/validate', views.AdminReferralForceValidateView.as_view(), name='api-admin-referral-validate'),
    path('admin/referrals/<str:referral_id>/reject', views.AdminReferralRejectView.as_view(), name='api-admin-referral-reject'),
]