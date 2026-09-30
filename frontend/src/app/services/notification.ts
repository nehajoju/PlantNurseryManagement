import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl =
    'https://plantnurserymanagement.onrender.com/api/notifications/';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}


  // ==============================
  // GET ALL NOTIFICATIONS
  // ==============================

  getNotifications(): Observable<any> {

    const token = this.auth.getToken();

    return this.http.get<any>(
      this.apiUrl,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // ==============================
  // GET UNREAD COUNT
  // ==============================

  getUnreadCount(): Observable<any> {

    const token = this.auth.getToken();

    return this.http.get<any>(
      `${this.apiUrl}unread-count/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // ==============================
  // MARK ONE AS READ
  // ==============================

  markAsRead(
    notificationId: number
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      `${this.apiUrl}${notificationId}/read/`,
      {},
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // ==============================
  // MARK ALL AS READ
  // ==============================

  markAllAsRead(): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      `${this.apiUrl}mark-all-read/`,
      {},
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }



  // ==============================
// DELETE ONE NOTIFICATION
// ==============================

deleteNotification(
  notificationId: number
): Observable<any> {

  const token = this.auth.getToken();

  return this.http.delete<any>(
    `${this.apiUrl}${notificationId}/delete/`,
    {
      headers: {
        Authorization: `Token ${token}`
      }
    }
  );
}


// ==============================
// DELETE ALL NOTIFICATIONS
// ==============================

deleteAllNotifications(): Observable<any> {

  const token = this.auth.getToken();

  return this.http.delete<any>(
    `${this.apiUrl}delete-all/`,
    {
      headers: {
        Authorization: `Token ${token}`
      }
    }
  );
} 
}



