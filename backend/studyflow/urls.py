from django.contrib import admin
from django.urls import path
from accounts import views as acc_views
from academic import views as acad_views
from courses import views as crs_views
from forms_builder import views as frm_views
from monetization import views as mon_views
from audit import views as aud_views
from assistant_ai import views as ai_views
from notifications import views as notif_views

urlpatterns = [
    # Django Administration UI
    path('admin/', admin.site.urls),

    # -------------------------------------------------------------
    # API: AUTHENTICATION
    # -------------------------------------------------------------
    path('api/auth/register', acc_views.RegisterView.as_view(), name='api-auth-register'),
    path('api/auth/login', acc_views.LoginView.as_view(), name='api-auth-login'),
    path('api/auth/me', acc_views.MeView.as_view(), name='api-auth-me'),

    # -------------------------------------------------------------
    # API: ACADEMIC METADATA
    # -------------------------------------------------------------
    path('api/academic/meta', acad_views.AcademicMetaView.as_view(), name='api-academic-meta'),

    # -------------------------------------------------------------
    # API: COURSES, SESSIONS & PROGRESSION
    # -------------------------------------------------------------
    path('api/courses', crs_views.CourseCatalogView.as_view(), name='api-courses-catalog'),
    path('api/courses/my-courses', crs_views.MyCoursesView.as_view(), name='api-my-courses'),
    path('api/courses/<str:ue_id>', crs_views.CourseDetailView.as_view(), name='api-course-detail'),

    path('api/sessions/<str:session_id>', crs_views.SessionDetailView.as_view(), name='api-session-detail'),
    path('api/sessions/<str:session_id>/complete', crs_views.SessionCompleteView.as_view(), name='api-session-complete'),
    path('api/quizzes/<str:quiz_id>/submit', crs_views.QuizSubmitView.as_view(), name='api-quiz-submit'),
    path('api/progress', crs_views.StudentProgressOverviewView.as_view(), name='api-progress'),

    # -------------------------------------------------------------
    # API: AI PEDAGOGICAL ASSISTANT (GEMINI)
    # -------------------------------------------------------------
    path('api/ai/ask', ai_views.AiAskView.as_view(), name='api-ai-ask'),

    # -------------------------------------------------------------
    # API: DYNAMIC FORMS
    # -------------------------------------------------------------
    path('api/forms', frm_views.FormListView.as_view(), name='api-forms-list'),
    path('api/forms/<str:form_id>', frm_views.FormDetailView.as_view(), name='api-form-detail'),
    path('api/forms/<str:form_id>/submit', frm_views.FormSubmitView.as_view(), name='api-form-submit'),

    # -------------------------------------------------------------
    # API: CONTACT & PUBLIC SERVICES
    # -------------------------------------------------------------
    path('api/contact', aud_views.ContactView.as_view(), name='api-contact'),

    # -------------------------------------------------------------
    # API: PROMO CODES & UNLOCK REQUESTS
    # -------------------------------------------------------------
    path('api/promo-codes/validate/<str:code>', mon_views.ValidatePromoCodeView.as_view(), name='api-promo-validate'),
    path('api/unlock-requests', mon_views.SubmitUnlockRequestView.as_view(), name='api-unlock-request-submit'),
    path('api/unlock-requests/my', mon_views.MyUnlockRequestsView.as_view(), name='api-unlock-requests-my'),

    # -------------------------------------------------------------
    # API: ADMINISTRATION (STAFF & SUPERUSER)
    # -------------------------------------------------------------
    path('api/admin/stats', aud_views.AdminStatsView.as_view(), name='api-admin-stats'),

    # User Management
    path('api/admin/users', acc_views.AdminUsersListView.as_view(), name='api-admin-users'),
    path('api/admin/users/<str:user_id>', acc_views.AdminUserDetailView.as_view(), name='api-admin-user-detail'),
    path('api/admin/users/<str:user_id>/access', acc_views.AdminUserAccessView.as_view(), name='api-admin-user-access'),

    # Course & Session Management
    path('api/admin/ues', crs_views.AdminUESaveView.as_view(), name='api-admin-ue-save'),
    path('api/admin/ues/<str:ue_id>/suspend', crs_views.AdminUESuspendView.as_view(), name='api-admin-ue-suspend'),
    path('api/admin/ues/<str:ue_id>', crs_views.AdminUEDeleteView.as_view(), name='api-admin-ue-delete'),

    path('api/admin/sessions', crs_views.AdminSessionSaveView.as_view(), name='api-admin-session-save'),
    path('api/admin/sessions/<str:session_id>/suspend', crs_views.AdminSessionSuspendView.as_view(), name='api-admin-session-suspend'),
    path('api/admin/sessions/<str:session_id>/toggle-access', crs_views.AdminSessionToggleAccessView.as_view(), name='api-admin-session-toggle-access'),
    path('api/admin/sessions/<str:session_id>', crs_views.AdminSessionDeleteView.as_view(), name='api-admin-session-delete'),

    # Academic Structure Management
    path('api/admin/departments', acad_views.AdminDepartmentView.as_view(), name='api-admin-dept-save'),
    path('api/admin/departments/<str:dept_id>/suspend', acad_views.AdminDepartmentSuspendView.as_view(), name='api-admin-dept-suspend'),
    path('api/admin/departments/<str:dept_id>', acad_views.AdminDepartmentDeleteView.as_view(), name='api-admin-dept-delete'),

    path('api/admin/programs', acad_views.AdminProgramView.as_view(), name='api-admin-prog-save'),
    path('api/admin/programs/<str:prog_id>/suspend', acad_views.AdminProgramSuspendView.as_view(), name='api-admin-prog-suspend'),
    path('api/admin/programs/<str:prog_id>', acad_views.AdminProgramDeleteView.as_view(), name='api-admin-prog-delete'),

    path('api/admin/academic-years', acad_views.AdminAcademicYearView.as_view(), name='api-admin-academic-year-create'),
    path('api/admin/academic-years/<str:ay_id>', acad_views.AdminAcademicYearView.as_view(), name='api-admin-academic-year-detail'),

    # Dynamic Forms Management
    path('api/admin/forms', frm_views.AdminFormCreateView.as_view(), name='api-admin-forms-create'),
    path('api/admin/forms/<str:form_id>', frm_views.AdminFormUpdateView.as_view(), name='api-admin-forms-update'),
    path('api/admin/forms/<str:form_id>/submissions', frm_views.AdminFormSubmissionsView.as_view(), name='api-admin-form-submissions'),
    path('api/admin/forms/<str:form_id>/export', frm_views.AdminFormExportCsvView.as_view(), name='api-admin-form-export'),

    # Promo Codes Management
    path('api/admin/promo-codes', mon_views.AdminPromoCodesView.as_view(), name='api-admin-promo-codes'),
    path('api/admin/promo-codes/<str:promo_id>/toggle', mon_views.AdminPromoCodeToggleView.as_view(), name='api-admin-promo-toggle'),
    path('api/admin/promo-codes/<str:promo_id>', mon_views.AdminPromoCodeDeleteView.as_view(), name='api-admin-promo-delete'),

    # Unlock Requests Management
    path('api/admin/unlock-requests', mon_views.AdminUnlockRequestsView.as_view(), name='api-admin-unlock-requests'),
    path('api/admin/unlock-requests/<str:req_id>/approve', mon_views.AdminApproveUnlockRequestView.as_view(), name='api-admin-unlock-approve'),
    path('api/admin/unlock-requests/<str:req_id>/reject', mon_views.AdminRejectUnlockRequestView.as_view(), name='api-admin-unlock-reject'),

    # -------------------------------------------------------------
    # API: INTERNAL NOTIFICATIONS (MESSAGES PROGRAMMES & ALERTES)
    # -------------------------------------------------------------
    path('api/notifications', notif_views.UserNotificationsListView.as_view(), name='api-notifications-list'),
    path('api/notifications/read-all', notif_views.NotificationMarkAllReadView.as_view(), name='api-notifications-read-all'),
    path('api/notifications/<str:notif_id>/read', notif_views.NotificationMarkReadView.as_view(), name='api-notifications-read-single'),

    # Admin Notifications Management
    path('api/admin/notifications', notif_views.AdminNotificationsView.as_view(), name='api-admin-notifications'),
    path('api/admin/notifications/<str:notif_id>', notif_views.AdminNotificationDetailView.as_view(), name='api-admin-notification-detail'),
    path('api/admin/notifications/<str:notif_id>/send-now', notif_views.AdminNotificationSendNowView.as_view(), name='api-admin-notification-send-now'),

    # Audit & Config Management
    path('api/admin/audit-logs', aud_views.AuditLogsListView.as_view(), name='api-admin-audit-logs'),
    path('api/admin/config', mon_views.AdminConfigView.as_view(), name='api-admin-config'),
    path('api/admin/export/<str:export_type>', aud_views.AdminExportView.as_view(), name='api-admin-export'),
]
