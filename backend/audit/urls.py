from django.urls import path
from . import views

urlpatterns = [
    # ===== Routes statiques EN PREMIER =====
    path('admin/trash', views.AdminTrashListView.as_view(), name='api-admin-trash-list'),
    path('admin/trash/purge-all', views.AdminTrashPurgeAllView.as_view(), name='api-admin-trash-purge-all'),
    path('admin/trash-bulk-action', views.AdminTrashBulkActionView.as_view(), name='api-admin-trash-bulk'),

    # ===== Routes dynamiques APRÈS =====
    path('admin/trash/<str:trash_id>/restore', views.AdminTrashRestoreView.as_view(), name='api-admin-trash-restore'),
    path('admin/trash/<str:trash_id>', views.AdminTrashDeleteView.as_view(), name='api-admin-trash-delete'),
]