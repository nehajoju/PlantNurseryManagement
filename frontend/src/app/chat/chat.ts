import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit {

  conversations: any[] = [];
  messages: any[] = [];

  selectedConversation: any = null;

  newMessage = '';

  loadingConversations = true;
  loadingMessages = false;
  sendingMessage = false;

  errorMessage = '';

  currentUserId: number | null = null;

  // New chat
  showNewChat = false;
  loadingChatUsers = false;
  creatingConversation = false;

  admins: any[] = [];
  staff: any[] = [];

  selectedChatType = '';
  selectedUserId: number | null = null;


  constructor(
    private chatService: ChatService,
    private auth: Auth
  ) {}


  ngOnInit(): void {
    this.getCurrentUser();
    this.loadConversations();
  }


  // Get logged-in user ID
  getCurrentUser(): void {

    this.currentUserId = this.auth.getUserId();

    console.log('Current User ID:', this.currentUserId);
  }


  // Load conversations
  loadConversations(): void {

    this.loadingConversations = true;
    this.errorMessage = '';

    this.chatService.getConversations().subscribe({

      next: (data) => {

        this.conversations = Array.isArray(data)
          ? data
          : data?.results || [];

        this.loadingConversations = false;

        if (
          this.conversations.length > 0 &&
          !this.selectedConversation
        ) {
          this.selectConversation(this.conversations[0]);
        }
      },

      error: (error) => {

        console.error(
          'Error loading conversations:',
          error
        );

        this.loadingConversations = false;

        this.errorMessage =
          error?.error?.error ||
          'Unable to load conversations.';
      }
    });
  }


  // Open conversation
  selectConversation(conversation: any): void {

    this.selectedConversation = conversation;

    this.loadMessages(conversation.id);
  }


  // Load messages
  loadMessages(conversationId: number): void {

    this.loadingMessages = true;

    this.chatService
      .getMessages(conversationId)
      .subscribe({

        next: (data) => {

          this.messages = Array.isArray(data)
            ? data
            : data?.results || [];

          this.loadingMessages = false;

          this.markConversationAsRead(
            conversationId
          );
        },

        error: (error) => {

          console.error(
            'Error loading messages:',
            error
          );

          this.loadingMessages = false;

          this.messages = [];

          this.errorMessage =
            error?.error?.error ||
            'Unable to load messages.';
        }
      });
  }


  // Send message
  sendMessage(): void {

    const message = this.newMessage.trim();

    if (!message) {
      return;
    }

    if (
      !this.selectedConversation ||
      this.sendingMessage
    ) {
      return;
    }

    this.sendingMessage = true;

    this.chatService
      .sendMessage(
        this.selectedConversation.id,
        message
      )
      .subscribe({

        next: (data) => {

          this.messages.push(data);

          this.newMessage = '';

          this.sendingMessage = false;

          this.selectedConversation.last_message = data;

          this.selectedConversation.updated_at =
            data.created_at;
        },

        error: (error) => {

          console.error(
            'Error sending message:',
            error
          );

          this.sendingMessage = false;

          this.errorMessage =
            error?.error?.error ||
            'Unable to send message.';
        }
      });
  }


  // Mark conversation as read
  markConversationAsRead(
    conversationId: number
  ): void {

    this.chatService
      .markConversationAsRead(conversationId)
      .subscribe({

        next: () => {

          const conversation =
            this.conversations.find(
              item => item.id === conversationId
            );

          if (conversation) {
            conversation.unread_count = 0;
          }
        },

        error: (error) => {

          console.error(
            'Unable to mark conversation as read:',
            error
          );
        }
      });
  }


  // Open New Chat window
  openNewChat(): void {

    this.showNewChat = true;

    this.selectedChatType = '';
    this.selectedUserId = null;

    this.loadChatUsers();
  }


  // Close New Chat window
  closeNewChat(): void {

    this.showNewChat = false;

    this.selectedChatType = '';
    this.selectedUserId = null;
  }


  // Load Admin and Staff users
  loadChatUsers(): void {

    this.loadingChatUsers = true;

    this.chatService
      .getChatUsers()
      .subscribe({

        next: (data) => {

          this.admins = (data?.admins || [])
            .filter(
              (user: any) =>
                Number(user.id) !== this.currentUserId
            );

          this.staff = (data?.staff || [])
            .filter(
              (user: any) =>
                Number(user.id) !== this.currentUserId
            );

          this.loadingChatUsers = false;
        },

        error: (error) => {

          console.error(
            'Error loading chat users:',
            error
          );

          this.loadingChatUsers = false;

          this.errorMessage =
            error?.error?.error ||
            'Unable to load Admin and Staff.';
        }
      });
  }


  // Change chat type
  changeChatType(): void {

    this.selectedUserId = null;
  }


  // Start new conversation
  startConversation(): void {

    if (
      !this.selectedChatType ||
      !this.selectedUserId ||
      this.creatingConversation
    ) {
      return;
    }

    this.creatingConversation = true;

    this.chatService
      .createConversation(
        this.selectedChatType,
        this.selectedUserId
      )
      .subscribe({

        next: (conversation) => {

          this.creatingConversation = false;

          this.showNewChat = false;

          this.selectedChatType = '';
          this.selectedUserId = null;

          const existingConversation =
            this.conversations.find(
              item => item.id === conversation.id
            );

          if (!existingConversation) {

            this.conversations.unshift(
              conversation
            );
          }

          this.selectConversation(
            conversation
          );
        },

        error: (error) => {

          console.error(
            'Error creating conversation:',
            error
          );

          this.creatingConversation = false;

          this.errorMessage =
            error?.error?.error ||
            'Unable to start conversation.';
        }
      });
  }


  // Conversation title
  getConversationTitle(
    conversation: any
  ): string {

    if (!conversation) {
      return 'Conversation';
    }

    if (
      conversation.conversation_type ===
      'USER_ADMIN'
    ) {

      return (
        conversation.user_name ||
        conversation.admin_name ||
        'Admin'
      );
    }

    if (
      conversation.conversation_type ===
      'USER_STAFF'
    ) {

      return (
        conversation.user_name ||
        conversation.staff_name ||
        'Staff'
      );
    }

    if (
      conversation.conversation_type ===
      'ADMIN_STAFF'
    ) {

      return (
        conversation.staff_name ||
        conversation.admin_name ||
        'Staff'
      );
    }

    return 'Conversation';
  }


  // Conversation type text
  getConversationType(
    conversation: any
  ): string {

    if (!conversation) {
      return '';
    }

    switch (
      conversation.conversation_type
    ) {

      case 'USER_ADMIN':
        return 'User - Admin';

      case 'USER_STAFF':
        return 'User - Staff';

      case 'ADMIN_STAFF':
        return 'Admin - Staff';

      default:
        return 'Conversation';
    }
  }


  // Check whether message belongs to current user
  isMyMessage(message: any): boolean {

    if (this.currentUserId === null) {
      return false;
    }

    return (
      Number(message.sender) ===
      this.currentUserId
    );
  }


  // Format message time
  formatMessageTime(date: string): string {

    if (!date) {
      return '';
    }

    const messageDate = new Date(date);

    return messageDate.toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }


  // Refresh conversations
  refresh(): void {

    this.loadConversations();
  }


  // Clear error
  clearError(): void {

    this.errorMessage = '';
  }
}