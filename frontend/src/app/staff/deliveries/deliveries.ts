import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../services/auth';
import { AlertService } from '../../services/alert';

@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './deliveries.html',
  styleUrl: './deliveries.css'
})
export class Deliveries implements OnInit {

  private apiUrl =
    'https://plantnurserymanagement.onrender.com/api/orders/staff/deliveries/';

  private statsApiUrl =
    'https://plantnurserymanagement.onrender.com/api/orders/staff/deliveries/stats/';

  deliveries: any[] = [];

  selectedDelivery: any = null;

  searchTerm = '';

  selectedDeliveryStatus = 'All';

  loading = true;

  loadingStats = true;

  updating = false;

  showDeliveryModal = false;

  // =========================
  // EXPECTED DELIVERY DATE
  // =========================

  showExpectedDateModal = false;

  expectedDeliveryDate = '';

  expectedDateError = '';

  selectedDeliveryForStart: any = null;

  minDeliveryDate = '';

  maxDeliveryDate = '';

  // =========================
  // DELIVERY STATISTICS
  // =========================

  totalDeliveries = 0;

  assignedDeliveries = 0;

  outForDelivery = 0;

  finishedDeliveries = 0;

  codPending = 0;

  codCollected = 0;

  deliveryStatuses = [
    'All',
    'Assigned',
    'Out for Delivery'
  ];

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {

    this.setDeliveryDateLimits();

    this.loadDeliveries();

    this.loadDeliveryStats();
  }

  // =========================
  // SET DATE LIMITS
  // =========================

  setDeliveryDateLimits(): void {

    const today = new Date();

    const formatDate = (date: Date): string => {

      const year = date.getFullYear();

      const month = String(
        date.getMonth() + 1
      ).padStart(2, '0');

      const day = String(
        date.getDate()
      ).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    this.minDeliveryDate = formatDate(today);

    const maximumDate = new Date(today);

    maximumDate.setDate(
      maximumDate.getDate() + 5
    );

    this.maxDeliveryDate =
      formatDate(maximumDate);
  }

  // =========================
  // LOAD DELIVERIES
  // =========================

  loadDeliveries(): void {

    this.loading = true;

    const token =
      this.auth.getToken();

    this.http.get<any[]>(
      this.apiUrl,
      {
        headers: {
          Authorization:
            `Token ${token}`
        },

        params: {
          search: this.searchTerm,

          delivery_status:
            this.selectedDeliveryStatus
        }
      }
    ).subscribe({

      next: (data) => {

        this.deliveries = data;

        this.loading = false;
      },

      error: (error) => {

        console.error(
          'Error loading deliveries:',
          error
        );

        this.loading = false;

        if (error.status === 401) {

          this.alertService.error(
            'Your staff session has expired. Please login again.'
          );
        }

        if (error.status === 403) {

          this.alertService.error(
            'You do not have Delivery responsibility.'
          );
        }
      }

    });
  }

  // =========================
  // LOAD STATISTICS
  // =========================

  loadDeliveryStats(): void {

    this.loadingStats = true;

    const token =
      this.auth.getToken();

    this.http.get<any>(
      this.statsApiUrl,
      {
        headers: {
          Authorization:
            `Token ${token}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.totalDeliveries =
          Number(data.total_deliveries || 0);

        this.assignedDeliveries =
          Number(data.assigned_deliveries || 0);

        this.outForDelivery =
          Number(data.out_for_delivery || 0);

        this.finishedDeliveries =
          Number(data.finished_deliveries || 0);

        this.codPending =
          Number(data.cod_pending || 0);

        this.codCollected =
          Number(data.cod_collected || 0);

        this.loadingStats = false;
      },

      error: (error) => {

        console.error(
          'Error loading delivery statistics:',
          error
        );

        this.loadingStats = false;
      }

    });
  }

  // =========================
  // REFRESH EVERYTHING
  // =========================

  refreshData(): void {

    this.loadDeliveries();

    this.loadDeliveryStats();
  }

  // =========================
  // SEARCH
  // =========================

  searchDeliveries(): void {

    this.loadDeliveries();
  }

  // =========================
  // FILTER
  // =========================

  filterDeliveries(): void {

    this.loadDeliveries();
  }

  // =========================
  // CLEAR SEARCH
  // =========================

  clearSearch(): void {

    this.searchTerm = '';

    this.loadDeliveries();
  }

  // =========================
  // OPEN DELIVERY
  // =========================

  openDelivery(
    delivery: any
  ): void {

    const token =
      this.auth.getToken();

    this.http.get<any>(
      `${this.apiUrl}${delivery.id}/`,
      {
        headers: {
          Authorization:
            `Token ${token}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.selectedDelivery = data;

        this.showDeliveryModal = true;
      },

      error: (error) => {

        console.error(
          'Error loading delivery details:',
          error
        );

        if (error.status === 403) {

          this.alertService.error(
            'You do not have permission to view this delivery.'
          );

          return;
        }

        this.alertService.error(
          'Unable to load delivery details.'
        );
      }

    });
  }

  // =========================
  // CLOSE MODAL
  // =========================

  closeDelivery(): void {

    if (this.updating) {

      return;
    }

    this.showDeliveryModal = false;

    this.selectedDelivery = null;
  }

  // =========================
  // OPEN EXPECTED DATE MODAL
  // =========================

  openExpectedDateModal(
    delivery: any
  ): void {

    this.selectedDeliveryForStart =
      delivery;

    this.expectedDeliveryDate = '';

    this.expectedDateError = '';

    this.setDeliveryDateLimits();

    this.showExpectedDateModal = true;
  }

  // =========================
  // CLOSE EXPECTED DATE MODAL
  // =========================

  closeExpectedDateModal(): void {

    if (this.updating) {

      return;
    }

    this.showExpectedDateModal = false;

    this.selectedDeliveryForStart =
      null;

    this.expectedDeliveryDate = '';

    this.expectedDateError = '';
  }

  // =========================
  // CONFIRM EXPECTED DATE
  // =========================

  confirmExpectedDeliveryDate(): void {

    this.expectedDateError = '';

    if (!this.selectedDeliveryForStart) {

      return;
    }

    if (!this.expectedDeliveryDate) {

      this.expectedDateError =
        'Please select an expected delivery date.';

      return;
    }

    if (
      this.expectedDeliveryDate <
      this.minDeliveryDate
    ) {

      this.expectedDateError =
        'Expected delivery date cannot be before today.';

      return;
    }

    if (
      this.expectedDeliveryDate >
      this.maxDeliveryDate
    ) {

      this.expectedDateError =
        'Expected delivery date must be within 5 days.';

      return;
    }

    this.performAction(
      this.selectedDeliveryForStart,
      'out_for_delivery',
      this.expectedDeliveryDate
    );
  }

  // =========================
  // DELIVERY ACTION
  // =========================

  performAction(
    delivery: any,
    action: string,
    expectedDate: string = ''
  ): void {

    let message = '';

    switch (action) {

      case 'out_for_delivery':

        if (!expectedDate) {

          this.openExpectedDateModal(
            delivery
          );

          return;
        }

        message =
          `Start delivery for Order #${delivery.id}?`;

        break;

      case 'collect_cod':

        message =
          `Confirm that ₹${delivery.total_amount} cash has been collected for Order #${delivery.id}?`;

        break;

      case 'deliver':

        message =
          `Mark Order #${delivery.id} as delivered?`;

        break;

      default:

        return;
    }

    const confirmed =
      confirm(message);

    if (!confirmed) {

      return;
    }

    this.updating = true;

    const token =
      this.auth.getToken();

    const requestBody: any = {
      action: action
    };

    if (
      action === 'out_for_delivery'
    ) {

      requestBody.expected_delivery_date =
        expectedDate;
    }

    this.http.patch<any>(
      `${this.apiUrl}${delivery.id}/action/`,
      requestBody,
      {
        headers: {
          Authorization:
            `Token ${token}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.updating = false;

        if (
          action === 'out_for_delivery'
        ) {

          this.showExpectedDateModal =
            false;

          this.selectedDeliveryForStart =
            null;

          this.expectedDeliveryDate =
            '';

          this.expectedDateError = '';
        }

        if (
          this.selectedDelivery &&
          this.selectedDelivery.id === delivery.id
        ) {

          this.selectedDelivery = data;
        }

        this.alertService.success(
          this.getActionSuccessMessage(
            action
          )
        );

        // Refresh active deliveries
        // and statistics.
        this.loadDeliveries();

        this.loadDeliveryStats();
      },

      error: (error) => {

        console.error(
          'Delivery action error:',
          error
        );

        this.updating = false;

        this.alertService.error(
          error.error?.error ||
          'Unable to complete this action.'
        );
      }

    });
  }

  // =========================
  // SUCCESS MESSAGE
  // =========================

  getActionSuccessMessage(
    action: string
  ): string {

    switch (action) {

      case 'out_for_delivery':

        return 'Delivery started successfully.';

      case 'collect_cod':

        return 'COD payment collected successfully.';

      case 'deliver':

        return 'Delivery completed successfully.';

      default:

        return 'Action completed successfully.';
    }
  }

  // =========================
  // CUSTOMER NAME
  // =========================

  getCustomerName(
    delivery: any
  ): string {

    if (delivery.customer_name) {

      return delivery.customer_name;
    }

    if (delivery.username) {

      return delivery.username;
    }

    return 'Customer';
  }

  // =========================
  // ITEM COUNT
  // =========================

  getItemCount(
    delivery: any
  ): number {

    if (!delivery.items) {

      return 0;
    }

    return delivery.items.reduce(
      (
        total: number,
        item: any
      ) => {

        return (
          total +
          Number(item.quantity)
        );

      },
      0
    );
  }

  // =========================
  // DELIVERY STATUS CLASS
  // =========================

  getDeliveryClass(
    status: string
  ): string {

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  // =========================
  // PAYMENT STATUS CLASS
  // =========================

  getPaymentClass(
    status: string
  ): string {

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  // =========================
  // IS COD
  // =========================

  isCOD(
    delivery: any
  ): boolean {

    return (
      delivery.payment_method === 'COD'
    );
  }

  // =========================
  // ASSIGNED TO ME
  // =========================

  isAssignedToMe(
    delivery: any
  ): boolean {

    const currentUserId =
      this.auth.getUserId();

    return (
      delivery.assigned_staff_id ===
      currentUserId
    );
  }

  // =========================
  // CAN START DELIVERY
  // =========================

  canStartDelivery(
    delivery: any
  ): boolean {

    return (

      this.isAssignedToMe(delivery) &&

      delivery.delivery_status ===
      'Assigned'

    );
  }

  // =========================
  // CAN COLLECT COD
  // =========================

  canCollectCOD(
    delivery: any
  ): boolean {

    return (

      this.isAssignedToMe(delivery) &&

      this.isCOD(delivery) &&

      delivery.payment_status ===
      'Pending' &&

      delivery.delivery_status ===
      'Out for Delivery'

    );
  }

  // =========================
  // CAN COMPLETE DELIVERY
  // =========================

  canCompleteDelivery(
    delivery: any
  ): boolean {

    if (
      !this.isAssignedToMe(delivery)
    ) {

      return false;
    }

    if (

      delivery.payment_method ===
      'COD' &&

      delivery.payment_status !==
      'Paid'

    ) {

      return false;
    }

    return (

      delivery.delivery_status ===
      'Out for Delivery'

    );
  }

}


