from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):

    TYPE_CHOICES = [
        ('ORDER', 'Order'),
        ('DELIVERY', 'Delivery'),
        ('STOCK', 'Stock'),
        ('GARDENING', 'Gardening'),
        ('CHAT', 'Chat'),
        ('STAFF', 'Staff'),
        ('SYSTEM', 'System'),
    ]

    PRIORITY_CHOICES = [
        ('NORMAL', 'Normal'),
        ('IMPORTANT', 'Important'),
        ('URGENT', 'Urgent'),
    ]

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    notification_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='SYSTEM'
    )

    title = models.CharField(
        max_length=150
    )

    message = models.TextField()

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='NORMAL'
    )

    is_read = models.BooleanField(
        default=False
    )

    related_id = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    related_url = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} - {self.recipient.username}'