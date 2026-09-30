import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../services/auth';
import { AlertService } from '../../services/alert';

@Component({
  selector: 'app-orders',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {

  private apiUrl =
    'https://plantnurserymanagement.onrender.com/api/orders/admin/';

  private staffApiUrl =
    'https://plantnurserymanagement.onrender.com/api/users/admin/staff/';

  private assignApiUrl =
    'https://plantnurserymanagement.onrender.com/api/orders/admin/';

  orders: any[] = [];

  filteredOrders: any[] = [];

  staff: any[] = [];

  deliveryStaff: any[] = [];

  selectedOrder: any = null;

  selectedStaffId: number | null = null;

  loading = true;

  loadingStaff = false;

  updating = false;

  assigning = false;

  searchTerm = '';

  selectedStatus = 'All';

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

    this.loadDeliveryStaff();

  }

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  loadOrders(): void {

    this.loading = true;

    this.http.get<any[]>(
      this.apiUrl,
      {
        headers: {
          Authorization:
            `Token ${this.auth.getToken()}`
        },

        params: {
          search: this.searchTerm,
          status: this.selectedStatus
        }
      }
    ).subscribe({

      next: (data) => {

        this.orders = data;

        this.filteredOrders = data;

        this.loading = false;

      },

      error: (error) => {

        console.error(
          'Error loading admin orders:',
          error
        );

        this.loading = false;

      }

    });

  }

  // =========================================================
  // LOAD DELIVERY STAFF
  // =========================================================

  loadDeliveryStaff(): void {

    this.loadingStaff = true;

    this.http.get<any[]>(
      this.staffApiUrl,
      {
        headers: {
          Authorization:
            `Token ${this.auth.getToken()}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.staff = data;

        /*
         * Only staff who are:
         *
         * 1. Active
         * 2. Assigned Delivery responsibility
         */
        this.deliveryStaff = data.filter(
          member =>
            member.is_active &&
            member.can_delivery
        );

        this.loadingStaff = false;

      },

      error: (error) => {

        console.error(
          'Error loading delivery staff:',
          error
        );

        this.loadingStaff = false;

        this.deliveryStaff = [];

      }

    });

  }

  // =========================================================
  // SEARCH
  // =========================================================

  searchOrders(): void {

    this.loadOrders();

  }

  // =========================================================
  // FILTER
  // =========================================================

  filterOrders(): void {

    this.loadOrders();

  }

  // =========================================================
  // OPEN ORDER DETAILS
  // =========================================================

  openOrderDetails(order: any): void {

    this.http.get<any>(
      `${this.apiUrl}${order.id}/`,
      {
        headers: {
          Authorization:
            `Token ${this.auth.getToken()}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.selectedOrder = data;

        /*
         * Pre-select currently assigned staff
         */
        this.selectedStaffId =
          data.assigned_staff_id || null;

        this.showOrderModal = true;

      },

      error: (error) => {

        console.error(
          'Error loading order details:',
          error
        );

      }

    });

  }

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  closeOrderModal(): void {

    if (
      this.updating ||
      this.assigning
    ) {
      return;
    }

    this.showOrderModal = false;

    this.selectedOrder = null;

    this.selectedStaffId = null;

  }

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  updateOrderStatus(status: string): void {

    if (!this.selectedOrder) {
      return;
    }

    this.updating = true;

    this.http.patch<any>(
      `${this.apiUrl}${this.selectedOrder.id}/`,
      {
        status: status
      },
      {
        headers: {
          Authorization:
            `Token ${this.auth.getToken()}`
        }
      }
    ).subscribe({

      next: (response) => {

        this.selectedOrder = response;

        this.selectedStaffId =
          response.assigned_staff_id || null;

        const index =
          this.orders.findIndex(
            order =>
              order.id === response.id
          );

        if (index !== -1) {

          this.orders[index] =
            response;

        }

        this.filteredOrders =
          [...this.orders];

        this.updating = false;

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

  // =========================================================
  // ASSIGN DELIVERY STAFF
  // =========================================================

  assignDeliveryStaff(): void {

    if (!this.selectedOrder) {
      return;
    }

    if (!this.selectedStaffId) {

      this.alert.warning(
        'Please select a Delivery Staff member.'
      );

      return;

    }

    const staff =
      this.deliveryStaff.find(
        member =>
          member.id === this.selectedStaffId
      );

    if (!staff) {

      this.alert.warning(
        'Selected staff member is not available.'
      );

      return;

    }

    const staffName =
      this.getStaffName(staff);

    const confirmed = confirm(
      `Assign Order #${this.selectedOrder.id} to ${staffName}?`
    );

    if (!confirmed) {
      return;
    }

    this.assigning = true;

    this.http.patch<any>(
      `${this.assignApiUrl}${this.selectedOrder.id}/assign-staff/`,
      {
        staff_id: this.selectedStaffId
      },
      {
        headers: {
          Authorization:
            `Token ${this.auth.getToken()}`
        }
      }
    ).subscribe({

      next: (response) => {

        this.assigning = false;

        this.selectedOrder =
          response.order;

        this.selectedStaffId =
          response.order.assigned_staff_id || null;

        const index =
          this.orders.findIndex(
            order =>
              order.id === response.order.id
          );

        if (index !== -1) {

          this.orders[index] =
            response.order;

        }

        this.filteredOrders =
          [...this.orders];

        this.alert.success(
          response.message ||
          'Delivery assigned successfully.'
        );

      },

      error: (error) => {

        console.error(
          'Error assigning delivery staff:',
          error
        );

        this.assigning = false;

        this.alert.error(
          error.error?.error ||
          'Unable to assign delivery staff.'
        );

      }

    });

  }

  // =========================================================
  // STAFF NAME
  // =========================================================

  getStaffName(member: any): string {

    const name =
      `${member.first_name || ''} ${member.last_name || ''}`
        .trim();

    return name || member.username;

  }

  // =========================================================
  // ORDER STATISTICS
  // =========================================================

  get totalOrders(): number {

    return this.orders.length;

  }

  get pendingOrders(): number {

    return this.orders.filter(
      order =>
        order.status === 'Pending'
    ).length;

  }

  get deliveredOrders(): number {

    return this.orders.filter(
      order =>
        order.status === 'Delivered'
    ).length;

  }

  get totalRevenue(): number {

    return this.orders.reduce(
      (total, order) =>
        total +
        Number(order.total_amount || 0),
      0
    );

  }

  // =========================================================
  // STATUS CLASS
  // =========================================================

  getStatusClass(status: string): string {

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');

  }

  // =========================================================
  // CUSTOMER NAME
  // =========================================================

  getCustomerName(order: any): string {

    return order.customer_name
      || order.username
      || 'Unknown Customer';

  }

  // =========================================================
  // ITEM TOTAL
  // =========================================================

  getItemTotal(item: any): number {

    return Number(item.price) *
      Number(item.quantity);

  }

}
