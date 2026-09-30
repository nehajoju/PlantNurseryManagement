
from .models import Notification


def create_notification(
    user,
    title,
    message,
    notification_type='SYSTEM',
    priority='NORMAL',
    related_id=None,
    related_url=None
):
    """
    Create a notification for a user.
    """

    if not user or not user.is_active:
        return None

    notification = Notification.objects.create(
        recipient=user,
        notification_type=notification_type,
        title=title,
        message=message,
        priority=priority,
        related_id=related_id,
        related_url=related_url
    )

    return notification


def create_notifications_for_users(
    users,
    title,
    message,
    notification_type='SYSTEM',
    priority='NORMAL',
    related_id=None,
    related_url=None
):
    """
    Create the same notification for multiple users.
    """

    notifications = []

    for user in users:

        if not user or not user.is_active:
            continue

        notifications.append(
            Notification(
                recipient=user,
                notification_type=notification_type,
                title=title,
                message=message,
                priority=priority,
                related_id=related_id,
                related_url=related_url
            )
        )

    if notifications:
        Notification.objects.bulk_create(notifications)

    return notifications