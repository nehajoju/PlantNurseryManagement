from django.contrib.auth.models import User
from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        conversations = Conversation.objects.filter(
            Q(user=user) |
            Q(staff=user) |
            Q(admin=user)
        ).filter(
            is_active=True
        ).select_related(
            'user',
            'staff',
            'admin'
        )

        serializer = ConversationSerializer(
            conversations,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)

    def post(self, request):

        user = request.user

        conversation_type = request.data.get(
            'conversation_type'
        )

        other_user_id = request.data.get(
            'other_user'
        )

        if conversation_type not in [
            'USER_ADMIN',
            'USER_STAFF',
            'ADMIN_STAFF'
        ]:
            return Response(
                {
                    'error': 'Invalid conversation type.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not other_user_id:
            return Response(
                {
                    'error': 'Other user is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            other_user = User.objects.get(
                id=other_user_id
            )
        except User.DoesNotExist:
            return Response(
                {
                    'error': 'User not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # USER ↔ ADMIN
        if conversation_type == 'USER_ADMIN':

            if user.is_superuser:

                if not other_user.is_active:
                    return Response(
                        {
                            'error': 'Selected user is inactive.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                customer = other_user
                admin = user

            else:

                if not other_user.is_superuser:
                    return Response(
                        {
                            'error': 'You can only start a user-admin conversation with an admin.'
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )

                customer = user
                admin = other_user

            conversation = Conversation.objects.filter(
                conversation_type='USER_ADMIN',
                user=customer,
                admin=admin,
                is_active=True
            ).first()

            if not conversation:
                conversation = Conversation.objects.create(
                    conversation_type='USER_ADMIN',
                    user=customer,
                    admin=admin
                )

        # USER ↔ STAFF
        elif conversation_type == 'USER_STAFF':

            if user.is_staff and not user.is_superuser:

                staff = user
                customer = other_user

                if customer.is_staff:
                    return Response(
                        {
                            'error': 'Staff can only start a user-staff conversation with a customer.'
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )

            else:

                customer = user
                staff = other_user

                if not staff.is_staff or staff.is_superuser:
                    return Response(
                        {
                            'error': 'Selected user is not a staff member.'
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )

            conversation = Conversation.objects.filter(
                conversation_type='USER_STAFF',
                user=customer,
                staff=staff,
                is_active=True
            ).first()

            if not conversation:
                conversation = Conversation.objects.create(
                    conversation_type='USER_STAFF',
                    user=customer,
                    staff=staff
                )

        # ADMIN ↔ STAFF
        else:

            if user.is_superuser:

                admin = user
                staff = other_user

                if not staff.is_staff or staff.is_superuser:
                    return Response(
                        {
                            'error': 'Selected user is not a staff member.'
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )

            elif user.is_staff:

                staff = user
                admin = other_user

                if not admin.is_superuser:
                    return Response(
                        {
                            'error': 'You can only start an admin-staff conversation with an admin.'
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )

            else:
                return Response(
                    {
                        'error': 'Only admin or staff can create an admin-staff conversation.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            conversation = Conversation.objects.filter(
                conversation_type='ADMIN_STAFF',
                admin=admin,
                staff=staff,
                is_active=True
            ).first()

            if not conversation:
                conversation = Conversation.objects.create(
                    conversation_type='ADMIN_STAFF',
                    admin=admin,
                    staff=staff
                )

        serializer = ConversationSerializer(
            conversation,
            context={'request': request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_conversation(self, request, pk):

        return Conversation.objects.filter(
            Q(user=request.user) |
            Q(staff=request.user) |
            Q(admin=request.user),
            id=pk,
            is_active=True
        ).select_related(
            'user',
            'staff',
            'admin'
        ).first()

    def get(self, request, pk):

        conversation = self.get_conversation(
            request,
            pk
        )

        if not conversation:
            return Response(
                {
                    'error': 'Conversation not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ConversationSerializer(
            conversation,
            context={'request': request}
        )

        return Response(serializer.data)

    def delete(self, request, pk):

        conversation = self.get_conversation(
            request,
            pk
        )

        if not conversation:
            return Response(
                {
                    'error': 'Conversation not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        conversation.is_active = False
        conversation.save(
            update_fields=[
                'is_active',
                'updated_at'
            ]
        )

        return Response(
            {
                'message': 'Conversation closed successfully.'
            }
        )


class MessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_conversation(self, request, pk):

        return Conversation.objects.filter(
            Q(user=request.user) |
            Q(staff=request.user) |
            Q(admin=request.user),
            id=pk,
            is_active=True
        ).first()

    def get(self, request, pk):

        conversation = self.get_conversation(
            request,
            pk
        )

        if not conversation:
            return Response(
                {
                    'error': 'Conversation not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        messages = Message.objects.filter(
            conversation=conversation
        ).select_related(
            'sender'
        )

        serializer = MessageSerializer(
            messages,
            many=True
        )

        return Response(serializer.data)

    def post(self, request, pk):

        conversation = self.get_conversation(
            request,
            pk
        )

        if not conversation:
            return Response(
                {
                    'error': 'Conversation not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        message_text = request.data.get(
            'message',
            ''
        ).strip()

        if not message_text:
            return Response(
                {
                    'error': 'Message cannot be empty.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            message=message_text
        )

        conversation.save(
            update_fields=[
                'updated_at'
            ]
        )

        serializer = MessageSerializer(
            message
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class MessageMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        message = Message.objects.filter(
            id=pk,
            conversation__is_active=True
        ).filter(
            Q(conversation__user=request.user) |
            Q(conversation__staff=request.user) |
            Q(conversation__admin=request.user)
        ).first()

        if not message:
            return Response(
                {
                    'error': 'Message not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if message.sender != request.user:
            message.is_read = True
            message.save(
                update_fields=[
                    'is_read'
                ]
            )

        return Response(
            {
                'message': 'Message marked as read.'
            }
        )


class MarkConversationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        conversation = Conversation.objects.filter(
            id=pk,
            is_active=True
        ).filter(
            Q(user=request.user) |
            Q(staff=request.user) |
            Q(admin=request.user)
        ).first()

        if not conversation:
            return Response(
                {
                    'error': 'Conversation not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        Message.objects.filter(
            conversation=conversation
        ).exclude(
            sender=request.user
        ).update(
            is_read=True
        )

        return Response(
            {
                'message': 'Conversation marked as read.'
            }
        )

class ChatUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        admins = User.objects.filter(
            is_superuser=True,
            is_active=True
        ).order_by('username')

        staff = User.objects.filter(
            is_staff=True,
            is_superuser=False,
            is_active=True
        ).order_by('username')

        def user_data(user):
            full_name = f'{user.first_name} {user.last_name}'.strip()

            return {
                'id': user.id,
                'username': user.username,
                'name': full_name or user.username,
            }

        return Response({
            'admins': [user_data(user) for user in admins],
            'staff': [user_data(user) for user in staff],
        })