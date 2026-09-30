import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StaffResponsibilityService } from '../../services/staff-responsibility';
import { Notification } from '../../components/notification/notification';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-staff-navbar',
  standalone: true,
  imports: [
    RouterLink,
    Notification
  ],
  templateUrl: './staff-navbar.html',
  styleUrl: './staff-navbar.css'
})
export class StaffNavbar implements OnInit {

  canDelivery = false;
  canStock = false;
  canGardening = false;

  loadingResponsibilities = true;

  constructor(
    private router: Router,
    private responsibilityService: StaffResponsibilityService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.loadResponsibilities();
  }

  loadResponsibilities(): void {

    this.loadingResponsibilities = true;

    this.responsibilityService.getResponsibilities()
      .subscribe({

        next: (data) => {

          this.canDelivery = data.can_delivery;
          this.canStock = data.can_stock;
          this.canGardening = data.can_gardening;

          this.loadingResponsibilities = false;
        },

        error: (error) => {

          console.error(
            'Error loading staff responsibilities:',
            error
          );

          this.loadingResponsibilities = false;
        }

      });
  }

  getUsername(): string {
    return this.auth.getUsername() || 'Staff';
  }

  logout(): void {

    this.auth.logout();

  }
}
