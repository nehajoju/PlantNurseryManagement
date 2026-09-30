import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../services/auth';
import { Notification } from '../notification/notification';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    Notification
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {

  isLoggedIn = false;
  username = '';

  showLogoutPopup = false;

  private authSubscription?: Subscription;

  constructor(
    private auth: Auth
  ) {}

  ngOnInit(): void {

    // Get current login status
    this.checkLoginStatus();

    // Listen for login/logout changes
    this.authSubscription = this.auth.loginStatus$.subscribe(() => {
      this.checkLoginStatus();
    });
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.username = this.auth.getUsername();
  }

  openLogoutPopup(): void {
    this.showLogoutPopup = true;
  }

  cancelLogout(): void {
    this.showLogoutPopup = false;
  }

  confirmLogout(): void {
    this.showLogoutPopup = false;

    this.auth.logout();

    this.isLoggedIn = false;
    this.username = '';
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
}