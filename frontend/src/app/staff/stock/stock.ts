import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-stock',
  imports: [CommonModule, FormsModule],
  templateUrl: './stock.html',
  styleUrl: './stock.css'
})
export class Stock implements OnInit {

  private apiUrl =
    'https://plantnurserymanagement.onrender.com/api/plants/staff/stock/';

  private historyUrl =
    'https://plantnurserymanagement.onrender.com/api/plants/staff/stock/history/';

  plants: any[] = [];
  movements: any[] = [];

  search = '';
  stockStatus = 'All';

  loading = true;
  loadingHistory = false;

  errorMessage = '';
  successMessage = '';

  showRestockModal = false;
  selectedPlant: any = null;

  restockQuantity: number | null = null;

  showHistoryModal = false;


  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}


  ngOnInit(): void {
    this.loadStock();
  }


  // -----------------------------------------
  // LOAD STOCK
  // -----------------------------------------

  loadStock(): void {

    this.loading = true;
    this.errorMessage = '';

    const token = this.auth.getToken();

    let url = this.apiUrl;

    const params: string[] = [];

    if (this.search.trim()) {

      params.push(
        `search=${encodeURIComponent(this.search.trim())}`
      );

    }

    if (this.stockStatus !== 'All') {

      params.push(
        `stock_status=${encodeURIComponent(this.stockStatus)}`
      );

    }

    if (params.length > 0) {

      url += '?' + params.join('&');

    }

    this.http.get<any[]>(url, {

      headers: {
        Authorization: `Token ${token}`
      }

    }).subscribe({

      next: (data) => {

        this.plants = data;
        this.loading = false;

      },

      error: (error) => {

        console.error(
          'Error loading stock:',
          error
        );

        this.loading = false;

        if (error.status === 401) {

          this.errorMessage =
            'Your session has expired. Please login again.';

        } else if (error.status === 403) {

          this.errorMessage =
            'You do not have Stock responsibility.';

        } else {

          this.errorMessage =
            'Unable to load stock information.';

        }

      }

    });

  }


  // -----------------------------------------
  // SEARCH
  // -----------------------------------------

  searchStock(): void {

    this.loadStock();

  }


  clearSearch(): void {

    this.search = '';

    this.loadStock();

  }


  // -----------------------------------------
  // STOCK STATUS
  // -----------------------------------------

  filterStock(status: string): void {

    this.stockStatus = status;

    this.loadStock();

  }


  // -----------------------------------------
  // RESTOCK MODAL
  // -----------------------------------------

  openRestockModal(plant: any): void {

    this.selectedPlant = plant;

    this.restockQuantity = null;

    this.errorMessage = '';
    this.successMessage = '';

    this.showRestockModal = true;

  }


  closeRestockModal(): void {

    this.showRestockModal = false;

    this.selectedPlant = null;

    this.restockQuantity = null;

  }


  // -----------------------------------------
  // RESTOCK
  // -----------------------------------------

  restock(): void {

    if (!this.selectedPlant) {

      return;

    }

    if (
      this.restockQuantity === null ||
      this.restockQuantity <= 0
    ) {

      this.errorMessage =
        'Please enter a valid quantity greater than 0.';

      return;

    }

    const token = this.auth.getToken();

    const url =
      `${this.apiUrl}${this.selectedPlant.id}/restock/`;

    this.http.patch<any>(
      url,
      {
        quantity: this.restockQuantity
      },
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    ).subscribe({

      next: (response) => {

        this.successMessage =
          response.message ||
          'Stock restocked successfully.';

        this.showRestockModal = false;

        this.selectedPlant = null;

        this.restockQuantity = null;

        this.loadStock();

        setTimeout(() => {

          this.successMessage = '';

        }, 3000);

      },

      error: (error) => {

        console.error(
          'Error restocking stock:',
          error
        );

        this.errorMessage =
          error.error?.error ||
          'Unable to restock stock.';

      }

    });

  }


  // -----------------------------------------
  // STOCK HISTORY
  // -----------------------------------------

  openHistory(): void {

    this.showHistoryModal = true;

    this.loadHistory();

  }


  closeHistory(): void {

    this.showHistoryModal = false;

  }


  loadHistory(): void {

    this.loadingHistory = true;

    const token = this.auth.getToken();

    this.http.get<any[]>(
      this.historyUrl,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    ).subscribe({

      next: (data) => {

        this.movements = data;

        this.loadingHistory = false;

      },

      error: (error) => {

        console.error(
          'Error loading stock history:',
          error
        );

        this.loadingHistory = false;

      }

    });

  }


  // -----------------------------------------
  // STATISTICS
  // -----------------------------------------

  get totalPlants(): number {

    return this.plants.length;

  }


  get availablePlants(): number {

    return this.plants.filter(
      plant =>
        plant.stock_status === 'Available'
    ).length;

  }


  get lowStockPlants(): number {

    return this.plants.filter(
      plant =>
        plant.stock_status === 'Low'
    ).length;

  }


  get outOfStockPlants(): number {

    return this.plants.filter(
      plant =>
        plant.stock_status === 'Out of Stock'
    ).length;

  }


  // -----------------------------------------
  // HELPERS
  // -----------------------------------------

  getStockClass(
    stockStatus: string
  ): string {

    if (stockStatus === 'Out of Stock') {

      return 'out-of-stock';

    }

    if (stockStatus === 'Low') {

      return 'low-stock';

    }

    return 'available';

  }


  getMovementClass(
    movementType: string
  ): string {

    return movementType === 'IN'
      ? 'stock-in'
      : 'stock-out';

  }


  formatDate(
    date: string
  ): string {

    if (!date) {

      return '-';

    }

    return new Date(date).toLocaleString();

  }

}


