from django.urls import path

from .views import (
    NotificationListView,
    NotificationUnreadCountView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    NotificationDeleteView,
    NotificationDeleteAllView,
)


urlpatterns = [

    # Get all notifications
    path(
        '',
        NotificationListView.as_view(),
        name='notifications'
    ),

    # Get unread notification count
    path(
        'unread-count/',
        NotificationUnreadCountView.as_view(),
        name='notification-unread-count'
    ),

    # Mark one notification as read
    path(
        '<int:pk>/read/',
        NotificationMarkReadView.as_view(),
        name='notification-mark-read'
    ),

    # Mark all notifications as read
    path(
        'mark-all-read/',
        NotificationMarkAllReadView.as_view(),
        name='notification-mark-all-read'
    ),

    # Delete one notification
    path(
        '<int:pk>/delete/',
        NotificationDeleteView.as_view(),
        name='notification-delete'
    ),

    # Delete / clear all notifications
    path(
        'delete-all/',
        NotificationDeleteAllView.as_view(),
        name='notification-delete-all'
    ),
]