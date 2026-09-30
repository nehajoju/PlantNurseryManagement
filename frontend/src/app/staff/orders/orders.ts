import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../services/auth';
import { AlertService } from '../../services/alert';

@Component({
  selector: 'app-orders',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {

  private apiUrl = 'http://https://plantnurserymanagement.onrender.com/api/orders/staff/';

  orders: any[] = [];

  selectedOrder: any = null;

  searchTerm = '';
  selectedStatus = 'All';

  loading = true;
  updating = false;

  showOrderModal = false;

  statuses = [
    'All',
    'Pending',
    'Confirmed',
    'Shipped',
    'Delivered',
    'Cancelled'
  ];

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {

    this.loading = true;

    const token = this.auth.getToken();

    this.http.get<any[]>(this.apiUrl, {
      headers: {
        Authorization: `Token ${token}`
      },
      params: {
        search: this.searchTerm,
        status: this.selectedStatus
      }
    }).subscribe({

      next: (data) => {

        this.orders = data;

        this.loading = false;

        console.log('Staff Orders:', this.orders);
      },

      error: (error) => {

        console.error(
          'Error loading staff orders:',
          error
        );

        this.loading = false;

        if (error.status === 401) {
          this.alert.error('Your staff session has expired. Please login again.');
        }

      }

    });
  }

  searchOrders(): void {
    this.loadOrders();
  }

  filterOrders(): void {
    this.loadOrders();
  }

  clearSearch(): void {

    this.searchTerm = '';

    this.loadOrders();
  }

  openOrder(order: any): void {

    const token = this.auth.getToken();

    this.http.get<any>(
      `${this.apiUrl}${order.id}/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.selectedOrder = data;

        this.showOrderModal = true;
      },

      error: (error) => {

        console.error(
          'Error loading order details:',
          error
        );

        this.alert.error('Unable to load order details.');
      }

    });
  }

  closeOrder(): void {

    this.showOrderModal = false;

    this.selectedOrder = null;
  }

  updateOrderStatus(
    order: any,
    newStatus: string
  ): void {

    if (!newStatus) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to change Order #${order.id} status to ${newStatus}?`
    );

    if (!confirmed) {
      return;
    }

    this.updating = true;

    const token = this.auth.getToken();

    this.http.patch<any>(
      `${this.apiUrl}${order.id}/`,
      {
        status: newStatus
      },
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.updating = false;

        order.status = data.status;

        if (
          this.selectedOrder &&
          this.selectedOrder.id === order.id
        ) {
          this.selectedOrder = data;
        }

        this.alert.success(
          `Order #${order.id} status updated successfully.`
        );

        this.loadOrders();
      },

      error: (error) => {

        console.error(
          'Error updating order status:',
          error
        );

        this.updating = false;

        this.alert.error(
          error.error?.error ||
          'Unable to update order status.'
        );
      }

    });
  }

  getCustomerName(order: any): string {

    if (order.customer_name) {
      return order.customer_name;
    }

    if (order.username) {
      return order.username;
    }

    return 'Customer';
  }

  getItemCount(order: any): number {

    if (!order.items) {
      return 0;
    }

    return order.items.reduce(
      (total: number, item: any) =>
        total + Number(item.quantity),
      0
    );
  }

  getStatusClass(status: string): string {

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  getPaymentClass(status: string): string {

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  isCOD(order: any): boolean {

    return order.payment_method === 'COD';
  }

  get totalOrders(): number {

    return this.orders.length;
  }

  get pendingOrders(): number {

    return this.orders.filter(
      order => order.status === 'Pending'
    ).length;
  }

  get confirmedOrders(): number {

    return this.orders.filter(
      order => order.status === 'Confirmed'
    ).length;
  }

  get shippedOrders(): number {

    return this.orders.filter(
      order => order.status === 'Shipped'
    ).length;
  }

  get deliveredOrders(): number {

    return this.orders.filter(
      order => order.status === 'Delivered'
    ).length;
  }

  get codPending(): number {

    return this.orders.filter(
      order =>
        order.payment_method === 'COD' &&
        order.payment_status === 'Pending'
    ).length;
  }

}