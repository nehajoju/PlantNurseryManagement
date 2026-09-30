import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://127.0.0.1:8000/api/chat/';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  private getHeaders() {
    const token = this.auth.getToken();

    return {
      Authorization: `Token ${token}`
    };
  }

  // =========================
  // CONVERSATIONS
  // =========================

  // Get all conversations of the logged-in user
  getConversations(): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}conversations/`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // Get available admins and staff
  getChatUsers(): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}users/`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // Create a new conversation
  createConversation(
    conversationType: string,
    otherUserId: number
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}conversations/`,
      {
        conversation_type: conversationType,
        other_user: otherUserId
      },
      {
        headers: this.getHeaders()
      }
    );
  }


  // Get one conversation
  getConversation(
    conversationId: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}conversations/${conversationId}/`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // MESSAGES
  // =========================

  // Get messages
  getMessages(
    conversationId: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}conversations/${conversationId}/messages/`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // Send message
  sendMessage(
    conversationId: number,
    message: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}conversations/${conversationId}/messages/`,
      {
        message: message
      },
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // READ STATUS
  // =========================

  // Mark one message as read
  markMessageAsRead(
    messageId: number
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}messages/${messageId}/read/`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }


  // Mark entire conversation as read
  markConversationAsRead(
    conversationId: number
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}conversations/${conversationId}/read/`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // CLOSE CONVERSATION
  // =========================

  // Close conversation
  closeConversation(
    conversationId: number
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUrl}conversations/${conversationId}/`,
      {
        headers: this.getHeaders()
      }
    );
  }
}