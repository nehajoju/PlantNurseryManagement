from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):

    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id',
            'conversation',
            'sender',
            'sender_name',
            'message',
            'is_read',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'sender',
            'sender_name',
            'is_read',
            'created_at',
        ]

    def get_sender_name(self, obj):
        full_name = (
            f'{obj.sender.first_name} '
            f'{obj.sender.last_name}'
        ).strip()

        return full_name or obj.sender.username


class ConversationSerializer(serializers.ModelSerializer):

    user_name = serializers.SerializerMethodField()
    staff_name = serializers.SerializerMethodField()
    admin_name = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id',
            'conversation_type',
            'user',
            'user_name',
            'staff',
            'staff_name',
            'admin',
            'admin_name',
            'last_message',
            'unread_count',
            'is_active',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user_name',
            'staff_name',
            'admin_name',
            'last_message',
            'unread_count',
            'created_at',
            'updated_at',
        ]

    def get_user_name(self, obj):
        if not obj.user:
            return None

        full_name = (
            f'{obj.user.first_name} '
            f'{obj.user.last_name}'
        ).strip()

        return full_name or obj.user.username

    def get_staff_name(self, obj):
        if not obj.staff:
            return None

        full_name = (
            f'{obj.staff.first_name} '
            f'{obj.staff.last_name}'
        ).strip()

        return full_name or obj.staff.username

    def get_admin_name(self, obj):
        if not obj.admin:
            return None

        full_name = (
            f'{obj.admin.first_name} '
            f'{obj.admin.last_name}'
        ).strip()

        return full_name or obj.admin.username

    def get_last_message(self, obj):
        message = obj.messages.order_by(
            '-created_at'
        ).first()

        if not message:
            return None

        return {
            'id': message.id,
            'sender': message.sender.id,
            'sender_name': (
                f'{message.sender.first_name} '
                f'{message.sender.last_name}'
            ).strip() or message.sender.username,
            'message': message.message,
            'is_read': message.is_read,
            'created_at': message.created_at,
        }

    def get_unread_count(self, obj):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            return 0

        return obj.messages.filter(
            is_read=False
        ).exclude(
            sender=request.user
        ).count()