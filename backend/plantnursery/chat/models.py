from django.db import models
from django.contrib.auth.models import User


class Conversation(models.Model):

    CONVERSATION_TYPE_CHOICES = [
        ('USER_ADMIN', 'User - Admin'),
        ('USER_STAFF', 'User - Staff'),
        ('ADMIN_STAFF', 'Admin - Staff'),
    ]

    conversation_type = models.CharField(
        max_length=20,
        choices=CONVERSATION_TYPE_CHOICES
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_conversations',
        null=True,
        blank=True
    )

    staff = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='staff_conversations',
        null=True,
        blank=True
    )

    admin = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='admin_conversations',
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    is_active = models.BooleanField(
        default=True
    )

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return (
            f'{self.get_conversation_type_display()} - '
            f'Conversation #{self.id}'
        )


class Message(models.Model):

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return (
            f'{self.sender.username} - '
            f'Conversation #{self.conversation.id}'
        )