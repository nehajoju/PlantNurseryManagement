import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Notification } from '../../components/notification/notification';

@Component({
  selector: 'app-admin-navbar',
  imports: [RouterLink, Notification],
  templateUrl: './admin-navbar.html',
  styleUrl: './admin-navbar.css'
})
export class AdminNavbar {

  constructor(
    private auth: Auth
  ) {}

  logout(): void {
    this.auth.logout();
  }
}