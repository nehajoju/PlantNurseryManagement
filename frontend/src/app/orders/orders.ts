import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { Cart } from '../services/cart';
import { AlertService } from '../services/alert';

@Component({
  selector: 'app-orders',
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {

  orders: any[] = [];

  loading = true;

  constructor(
    private cartService: Cart,
    private alert: AlertService
  ) {}

  ngOnInit(): void {

    this.loadOrders();

  }

  loadOrders(): void {

    this.cartService.getOrders().subscribe({

      next: (data) => {

        this.orders = data;

        this.loading = false;

        console.log('Orders:', this.orders);

      },

      error: (error) => {

        console.error('Error loading orders:', error);

        this.loading = false;

      }

    });

  }
  getStatusStep(status: string): number {

  const steps: { [key: string]: number } = {
    Pending: 1,
    Confirmed: 2,
    Shipped: 3,
    Delivered: 4
  };

  return steps[status] || 1;
}

  downloadReceipt(orderId: number): void {

    this.cartService.downloadReceipt(orderId).subscribe({

      next: (pdf: Blob) => {

        const url = window.URL.createObjectURL(pdf);

        const link = document.createElement('a');

        link.href = url;

        link.download = `PlantNest_Order_${orderId}.pdf`;

        link.click();

        window.URL.revokeObjectURL(url);

      },

      error: (error) => {

        console.error(
          'Error downloading receipt:',
          error
        );

        this.alert.error('Unable to download receipt.');

      }

    });

  }

}