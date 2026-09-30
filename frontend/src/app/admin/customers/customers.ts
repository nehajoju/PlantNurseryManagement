import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-customers',
  imports: [
    FormsModule,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class Customers implements OnInit {

  private apiUrl =
    'http://https://plantnurserymanagement.onrender.com/api/users/admin/customers/';

  customers: any[] = [];

  selectedCustomer: any = null;

  searchTerm = '';

  loading = true;

  showCustomerModal = false;

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {

    this.loading = true;

    this.http.get<any[]>(
      this.apiUrl,
      {
        headers: {
          Authorization:
            `Token ${this.auth.getToken()}`
        },
        params: {
          search: this.searchTerm
        }
      }
    ).subscribe({

      next: (data) => {

        this.customers = data;

        this.loading = false;
      },

      error: (error) => {

        console.error(
          'Error loading customers:',
          error
        );

        this.loading = false;
      }

    });
  }

  searchCustomers(): void {
    this.loadCustomers();
  }

  clearSearch(): void {

    this.searchTerm = '';

    this.loadCustomers();
  }

  openCustomerDetails(customer: any): void {

    this.http.get<any>(
      `${this.apiUrl}${customer.id}/`,
      {
        headers: {
          Authorization:
            `Token ${this.auth.getToken()}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.selectedCustomer = data;

        this.showCustomerModal = true;
      },

      error: (error) => {

        console.error(
          'Error loading customer details:',
          error
        );

      }

    });
  }

  closeCustomerModal(): void {

    this.showCustomerModal = false;

    this.selectedCustomer = null;
  }

  get totalCustomers(): number {
    return this.customers.length;
  }

  get customersWithOrders(): number {

    return this.customers.filter(
      customer =>
        Number(customer.total_orders) > 0
    ).length;

  }

  get totalRevenue(): number {

    return this.customers.reduce(
      (total, customer) =>
        total +
        Number(customer.total_spent || 0),
      0
    );

  }

  get averageCustomerValue(): number {

    if (this.customers.length === 0) {
      return 0;
    }

    return this.totalRevenue /
      this.customers.length;

  }

  getCustomerName(customer: any): string {

    return customer.customer_name
      || customer.username
      || 'Unknown Customer';

  }

  getOrderItemCount(order: any): number {

    if (!order.items) {
      return 0;
    }

    return order.items.reduce(
      (total: number, item: any) =>
        total + Number(item.quantity),
      0
    );

  }
}