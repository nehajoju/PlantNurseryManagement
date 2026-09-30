from django.urls import path

from .views import (
    ChatUserListView,
    ConversationListCreateView,
    ConversationDetailView,
    MessageListCreateView,
    MessageMarkReadView,
    MarkConversationReadView,
)


urlpatterns = [

    # Conversations
    path(
        'conversations/',
        ConversationListCreateView.as_view(),
        name='conversation-list-create'
    ),

    path(
        'conversations/<int:pk>/',
        ConversationDetailView.as_view(),
        name='conversation-detail'
    ),

    # Messages
    path(
        'conversations/<int:pk>/messages/',
        MessageListCreateView.as_view(),
        name='message-list-create'
    ),

    # Mark one message as read
    path(
        'messages/<int:pk>/read/',
        MessageMarkReadView.as_view(),
        name='message-mark-read'
    ),

    # Mark complete conversation as read
    path(
        'conversations/<int:pk>/read/',
        MarkConversationReadView.as_view(),
        name='conversation-mark-read'
    ),
    path('users/', ChatUserListView.as_view(), name='chat-users'),
]