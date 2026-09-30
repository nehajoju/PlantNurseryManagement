import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { StaffResponsibilityService } from '../../services/staff-responsibility';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private apiUrl =
    'https://plantnurserymanagement.onrender.com/api/orders/staff/';

  orders: any[] = [];

  loading = true;

  // -----------------------------------------
  // STAFF RESPONSIBILITIES
  // -----------------------------------------

  canDelivery = false;
  canStock = false;
  canGardening = false;

  loadingResponsibilities = true;


  constructor(
    private http: HttpClient,
    private responsibilityService:
      StaffResponsibilityService,
    private auth: Auth
  ) {}


  ngOnInit(): void {

    this.loadResponsibilities();

    this.loadOrders();

  }


  // -----------------------------------------
  // LOAD STAFF RESPONSIBILITIES
  // -----------------------------------------

  loadResponsibilities(): void {

    this.loadingResponsibilities = true;

    this.responsibilityService
      .getResponsibilities()
      .subscribe({

        next: (data) => {

          this.canDelivery =
            data.can_delivery === true;

          this.canStock =
            data.can_stock === true;

          this.canGardening =
            data.can_gardening === true;

          this.loadingResponsibilities = false;

        },

        error: (error) => {

          console.error(
            'Error loading staff responsibilities:',
            error
          );

          this.canDelivery = false;
          this.canStock = false;
          this.canGardening = false;

          this.loadingResponsibilities = false;

        }

      });

  }


  // -----------------------------------------
  // LOAD ORDERS
  // -----------------------------------------

  loadOrders(): void {

    this.loading = true;

    const token =
      this.auth.getToken();

    this.http.get<any[]>(
      this.apiUrl,
      {
        headers: {
          Authorization:
            `Token ${token}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.orders = data;

        this.loading = false;

      },

      error: (error) => {

        console.error(
          'Error loading staff dashboard orders:',
          error
        );

        this.loading = false;

      }

    });

  }


  // -----------------------------------------
  // ORDER COUNTS
  // -----------------------------------------

  get totalOrders(): number {

    return this.orders.length;

  }


  get pendingOrders(): number {

    return this.orders.filter(
      order =>
        order.status === 'Pending'
    ).length;

  }


  get confirmedOrders(): number {

    return this.orders.filter(
      order =>
        order.status === 'Confirmed'
    ).length;

  }


  get shippedOrders(): number {

    return this.orders.filter(
      order =>
        order.status === 'Shipped'
    ).length;

  }


  get deliveredOrders(): number {

    return this.orders.filter(
      order =>
        order.status === 'Delivered'
    ).length;

  }


  // -----------------------------------------
  // DELIVERY INFORMATION
  // -----------------------------------------
  // These values are only meaningful for
  // staff who have Delivery responsibility.
  // -----------------------------------------

  get deliveryOrders(): number {

    if (!this.canDelivery) {
      return 0;
    }

    return this.orders.filter(
      order =>
        order.assigned_staff_id !== null &&
        order.assigned_staff_id !== undefined &&
        order.delivery_status !== 'Delivered'
    ).length;

  }


  get codPending(): number {

    if (!this.canDelivery) {
      return 0;
    }

    return this.orders.filter(
      order =>
        order.payment_method === 'COD' &&
        order.payment_status === 'Pending' &&
        order.assigned_staff_id !== null &&
        order.assigned_staff_id !== undefined
    ).length;

  }


  get codPaid(): number {

    if (!this.canDelivery) {
      return 0;
    }

    return this.orders.filter(
      order =>
        order.payment_method === 'COD' &&
        order.payment_status === 'Paid' &&
        order.assigned_staff_id !== null &&
        order.assigned_staff_id !== undefined
    ).length;

  }


  // -----------------------------------------
  // RECENT ORDERS
  // -----------------------------------------

  get recentOrders(): any[] {

    return [...this.orders]

      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )

      .slice(0, 5);

  }


  // -----------------------------------------
  // CUSTOMER NAME
  // -----------------------------------------

  getCustomerName(order: any): string {

    return (
      order.customer_name ||
      order.username ||
      'Customer'
    );

  }


  // -----------------------------------------
  // STATUS CSS CLASS
  // -----------------------------------------

  getStatusClass(
    status: string
  ): string {

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');

  }


  // -----------------------------------------
  // ITEM COUNT
  // -----------------------------------------

  getItemCount(
    order: any
  ): number {

    if (!order.items) {

      return 0;

    }

    return order.items.reduce(
      (
        total: number,
        item: any
      ) =>
        total +
        Number(item.quantity),
      0
    );

  }

}
