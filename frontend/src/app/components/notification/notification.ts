import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class Notification implements OnInit {

  notifications: any[] = [];
  unreadCount = 0;
  showNotifications = false;

  deletingNotificationIds: number[] = [];
  clearingAll = false;

  constructor(
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    this.loadNotifications();
    this.loadUnreadCount();

  }


  // ==============================
  // LOAD NOTIFICATIONS
  // ==============================

  loadNotifications(): void {

    this.notificationService.getNotifications().subscribe({

      next: (data) => {

        this.notifications = data;

      },

      error: (error: any) => {

        console.error(
          'Failed to load notifications:',
          error
        );

      }

    });

  }


  // ==============================
  // LOAD UNREAD COUNT
  // ==============================

  loadUnreadCount(): void {

    this.notificationService.getUnreadCount().subscribe({

      next: (data) => {

        this.unreadCount =
          data.unread_count;

      },

      error: (error: any) => {

        console.error(
          'Failed to load unread count:',
          error
        );

      }

    });

  }


  // ==============================
  // TOGGLE DROPDOWN
  // ==============================

  toggleNotifications(): void {

    this.showNotifications =
      !this.showNotifications;

    if (this.showNotifications) {

      this.loadNotifications();
      this.loadUnreadCount();

    }

  }


  // ==============================
  // CLOSE DROPDOWN
  // ==============================

  closeNotifications(): void {

    this.showNotifications = false;

  }


  // ==============================
  // MARK ONE AS READ
  // ==============================

  markAsRead(notification: any): void {

    if (notification.is_read) {

      return;

    }


    this.notificationService
      .markAsRead(notification.id)
      .subscribe({

        next: () => {

          notification.is_read = true;

          if (this.unreadCount > 0) {

            this.unreadCount--;

          }

        },

        error: (error: any) => {

          console.error(
            'Failed to mark notification as read:',
            error
          );

        }

      });

  }


  // ==============================
  // MARK ALL AS READ
  // ==============================

  markAllAsRead(): void {

    if (this.unreadCount === 0) {

      return;

    }


    this.notificationService
      .markAllAsRead()
      .subscribe({

        next: () => {

          this.notifications.forEach(
            notification =>
              notification.is_read = true
          );

          this.unreadCount = 0;

        },

        error: (error: any) => {

          console.error(
            'Failed to mark all notifications as read:',
            error
          );

        }

      });

  }


  // ==============================
  // CHECK DELETE STATUS
  // ==============================

  isDeleting(notificationId: number): boolean {

    return this.deletingNotificationIds
      .includes(notificationId);

  }


  // ==============================
  // DELETE ONE NOTIFICATION
  // ==============================

  deleteNotification(
    event: Event,
    notification: any
  ): void {

    /*
      Stop the notification item's
      click event from firing.
    */

    event.stopPropagation();


    if (this.isDeleting(notification.id)) {

      return;

    }


    this.deletingNotificationIds.push(
      notification.id
    );


    this.notificationService
      .deleteNotification(notification.id)
      .subscribe({

        next: () => {

          this.notifications =
            this.notifications.filter(
              item =>
                item.id !== notification.id
            );


          if (!notification.is_read &&
              this.unreadCount > 0) {

            this.unreadCount--;

          }


          this.removeDeletingId(
            notification.id
          );

        },

        error: (error: any) => {

          console.error(
            'Failed to delete notification:',
            error
          );


          this.removeDeletingId(
            notification.id
          );

        }

      });

  }


  // ==============================
  // REMOVE DELETE LOCK
  // ==============================

  private removeDeletingId(
    notificationId: number
  ): void {

    this.deletingNotificationIds =
      this.deletingNotificationIds.filter(
        id => id !== notificationId
      );

  }


  // ==============================
  // CLEAR ALL NOTIFICATIONS
  // ==============================

  clearAllNotifications(): void {

    if (
      this.notifications.length === 0 ||
      this.clearingAll
    ) {

      return;

    }


    this.clearingAll = true;


    this.notificationService
      .deleteAllNotifications()
      .subscribe({

        next: () => {

          this.notifications = [];

          this.unreadCount = 0;

          this.clearingAll = false;

        },

        error: (error: any) => {

          console.error(
            'Failed to clear notifications:',
            error
          );

          this.clearingAll = false;

        }

      });

  }

}
