import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class Cart {

  private apiUrl = 'https://plantnurserymanagement.onrender.com/api/cart/';
  private ordersApiUrl = 'https://plantnurserymanagement.onrender.com/api/orders/';
  private profileApiUrl = 'https://plantnurserymanagement.onrender.com/api/users/profile/';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) { }


  // =========================
  // CART
  // =========================

  getCart(): Observable<any[]> {

    const token = this.auth.getToken();

    return this.http.get<any[]>(
      this.apiUrl,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  addToCart(
    plantId: number,
    quantity: number = 1
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      this.apiUrl,
      {
        plant: plantId,
        quantity: quantity
      },
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  updateQuantity(
    cartId: number,
    quantity: number
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.patch<any>(
      `${this.apiUrl}${cartId}/`,
      {
        quantity: quantity
      },
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  removeFromCart(cartId: number): Observable<any> {

    const token = this.auth.getToken();

    return this.http.delete<any>(
      `${this.apiUrl}${cartId}/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // =========================
  // WISHLIST
  // =========================

  getWishlist(): Observable<any[]> {

    const token = this.auth.getToken();

    return this.http.get<any[]>(
      `${this.apiUrl}wishlist/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  addToWishlist(
    plantId: number
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      `${this.apiUrl}wishlist/`,
      {
        plant: plantId
      },
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  removeFromWishlist(
    wishlistId: number
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.delete<any>(
      `${this.apiUrl}wishlist/${wishlistId}/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // =========================
  // USER PROFILE
  // =========================

  getUserProfile(): Observable<any> {

    const token = this.auth.getToken();

    return this.http.get<any>(
      this.profileApiUrl,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // =========================
  // ORDERS
  // =========================

  getOrders(): Observable<any[]> {

    const token = this.auth.getToken();

    return this.http.get<any[]>(
      this.ordersApiUrl,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // =========================
  // CREATE COD ORDER
  // =========================

  createOrder(
    orderData: any
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      this.ordersApiUrl,
      orderData,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // =========================
  // RAZORPAY
  // =========================

  createRazorpayOrder(): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      `${this.ordersApiUrl}razorpay/create/`,
      {},
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  verifyRazorpayPayment(
    paymentData: any
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      `${this.ordersApiUrl}razorpay/verify/`,
      paymentData,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // =========================
  // DOWNLOAD RECEIPT
  // =========================

  downloadReceipt(
    orderId: number
  ): Observable<Blob> {

    const token = this.auth.getToken();

    return this.http.get(
      `${this.ordersApiUrl}${orderId}/receipt/`,
      {
        headers: {
          Authorization: `Token ${token}`
        },
        responseType: 'blob'
      }
    );
  }

}
