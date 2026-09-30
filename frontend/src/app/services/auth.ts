import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private readonly SESSION_KEYS = {
    token: 'token',
    userId: 'user_id',
    username: 'username',
    email: 'email',
    isStaff: 'is_staff',
    isSuperuser: 'is_superuser'
  };

  // Keeps track of login/logout changes
  private loginStatusSubject = new BehaviorSubject<boolean>(
    !!sessionStorage.getItem(this.SESSION_KEYS.token)
  );

  // Navbar and other components can listen to this
  loginStatus$ = this.loginStatusSubject.asObservable();

  constructor(private router: Router) {}

  setSession(response: any): void {

    sessionStorage.setItem(
      this.SESSION_KEYS.token,
      response.token
    );

    sessionStorage.setItem(
      this.SESSION_KEYS.userId,
      String(response.user_id)
    );

    sessionStorage.setItem(
      this.SESSION_KEYS.username,
      response.username || ''
    );

    sessionStorage.setItem(
      this.SESSION_KEYS.email,
      response.email || ''
    );

    sessionStorage.setItem(
      this.SESSION_KEYS.isStaff,
      String(response.is_staff)
    );

    sessionStorage.setItem(
      this.SESSION_KEYS.isSuperuser,
      String(response.is_superuser)
    );

    // Tell the navbar that login happened
    this.loginStatusSubject.next(true);
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.SESSION_KEYS.token);
  }

  getToken(): string {
    return sessionStorage.getItem(this.SESSION_KEYS.token) || '';
  }

  getUserId(): number | null {
    const userId = sessionStorage.getItem(this.SESSION_KEYS.userId);

    return userId ? Number(userId) : null;
  }

  getUsername(): string {
    return sessionStorage.getItem(this.SESSION_KEYS.username) || '';
  }

  getEmail(): string {
    return sessionStorage.getItem(this.SESSION_KEYS.email) || '';
  }

  isAdmin(): boolean {
    return sessionStorage.getItem(this.SESSION_KEYS.isSuperuser) === 'true';
  }

  isStaff(): boolean {
    return (
      sessionStorage.getItem(this.SESSION_KEYS.isStaff) === 'true'
      && !this.isAdmin()
    );
  }

  isCustomer(): boolean {
    return (
      this.isLoggedIn()
      && !this.isAdmin()
      && !this.isStaff()
    );
  }

  getRole(): 'admin' | 'staff' | 'customer' | null {

    if (!this.isLoggedIn()) {
      return null;
    }

    if (this.isAdmin()) {
      return 'admin';
    }

    if (this.isStaff()) {
      return 'staff';
    }

    return 'customer';
  }

  logout(): void {

    sessionStorage.clear();

    // Tell the navbar that logout happened
    this.loginStatusSubject.next(false);

    this.router.navigate(['/login']);
  }
}
