from django.urls import path
from . import views

urlpatterns = [
    # Corbeille (Superuser uniquement)
    path('admin/trash', views.AdminTrashListView.as_view(), name='api-admin-trash-list'),
    path('admin/trash/<str:trash_id>/restore', views.AdminTrashRestoreView.as_view(), name='api-admin-trash-restore'),
    path('admin/trash/<str:trash_id>', views.AdminTrashDeleteView.as_view(), name='api-admin-trash-delete'),
    path('admin/trash-bulk-action', views.AdminTrashBulkActionView.as_view(), name='api-admin-trash-bulk'),
    path('admin/trash/purge-all', views.AdminTrashPurgeAllView.as_view(), name='api-admin-trash-purge-all'),
]