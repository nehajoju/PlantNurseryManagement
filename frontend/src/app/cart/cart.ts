import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cart } from '../services/cart';
import { AlertService } from '../services/alert';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {

  cartItems: any[] = [];
  wishlistItems: any[] = [];

  updatingItems: number[] = [];


  constructor(
    private cartService: Cart,
    private alert: AlertService
  ) { }


  ngOnInit(): void {

    this.loadCart();

    this.loadWishlist();

  }


  // =========================
  // LOAD CART
  // =========================

  loadCart(): void {

    this.cartService.getCart().subscribe({

      next: (data) => {

        this.cartItems = data;

        console.log(
          'Cart:',
          this.cartItems
        );

      },


      error: (error) => {

        console.error(
          'Error loading cart:',
          error
        );

        this.alert.error(
          'Unable to load your cart.'
        );

      }

    });

  }


  // =========================
  // CHECK UPDATE STATUS
  // =========================

  isUpdating(item: any): boolean {

    return this.updatingItems.includes(
      item.id
    );

  }


  // =========================
  // INCREASE QUANTITY
  // =========================

  increaseQuantity(item: any): void {

    // Prevent duplicate requests

    if (this.isUpdating(item)) {

      return;

    }


    const currentQuantity =
      Number(item.quantity);


    // Safety check

    if (
      !Number.isInteger(currentQuantity) ||
      currentQuantity < 1
    ) {

      item.quantity = 1;

      this.alert.warning(
        'Invalid quantity. Quantity has been reset to 1.'
      );

      return;

    }


    /*
      Different APIs may return stock as:

      item.stock
      item.plant_stock

      Use whichever is available.
    */

    const availableStock =
      item.stock ??
      item.plant_stock;


    // Check available stock if provided

    if (
      availableStock !== undefined &&
      availableStock !== null
    ) {

      const stock =
        Number(availableStock);


      if (
        Number.isFinite(stock) &&
        currentQuantity >= stock
      ) {

        this.alert.warning(
          `Only ${stock} item(s) available in stock.`
        );

        return;

      }

    }


    const newQuantity =
      currentQuantity + 1;


    this.updatingItems.push(item.id);


    this.cartService
      .updateQuantity(
        item.id,
        newQuantity
      )
      .subscribe({

        next: () => {

          item.quantity =
            newQuantity;


          this.removeUpdatingItem(
            item.id
          );

        },


        error: (error) => {

          console.error(
            'Error increasing quantity:',
            error
          );


          this.removeUpdatingItem(
            item.id
          );


          if (error.error?.error) {

            this.alert.warning(
              error.error.error
            );

          } else {

            this.alert.error(
              'Unable to increase quantity.'
            );

          }

        }

      });

  }


  // =========================
  // DECREASE QUANTITY
  // =========================

  decreaseQuantity(item: any): void {

    if (this.isUpdating(item)) {

      return;

    }


    const currentQuantity =
      Number(item.quantity);


    // Never allow invalid quantity

    if (
      !Number.isInteger(currentQuantity) ||
      currentQuantity <= 1
    ) {

      item.quantity = 1;

      return;

    }


    const newQuantity =
      currentQuantity - 1;


    // Safety check

    if (newQuantity < 1) {

      return;

    }


    this.updatingItems.push(item.id);


    this.cartService
      .updateQuantity(
        item.id,
        newQuantity
      )
      .subscribe({

        next: () => {

          item.quantity =
            newQuantity;


          this.removeUpdatingItem(
            item.id
          );

        },


        error: (error) => {

          console.error(
            'Error decreasing quantity:',
            error
          );


          this.removeUpdatingItem(
            item.id
          );


          if (error.error?.error) {

            this.alert.warning(
              error.error.error
            );

          } else {

            this.alert.error(
              'Unable to decrease quantity.'
            );

          }

        }

      });

  }


  // =========================
  // REMOVE UPDATE LOCK
  // =========================

  private removeUpdatingItem(
    itemId: number
  ): void {

    this.updatingItems =
      this.updatingItems.filter(
        id => id !== itemId
      );

  }


  // =========================
  // REMOVE FROM CART
  // =========================

  removeFromCart(item: any): void {

    this.cartService
      .removeFromCart(item.id)
      .subscribe({

        next: () => {

          this.cartItems =
            this.cartItems.filter(
              cartItem =>
                cartItem.id !== item.id
            );


          this.alert.success(
            'Item removed from cart.'
          );

        },


        error: (error) => {

          console.error(
            'Error removing item from cart:',
            error
          );


          if (error.error?.error) {

            this.alert.error(
              error.error.error
            );

          } else {

            this.alert.error(
              'Unable to remove item from cart.'
            );

          }

        }

      });

  }


  // =========================
  // LOAD WISHLIST
  // =========================

  loadWishlist(): void {

    this.cartService
      .getWishlist()
      .subscribe({

        next: (data) => {

          this.wishlistItems =
            data;

          console.log(
            'Wishlist:',
            this.wishlistItems
          );

        },


        error: (error) => {

          console.error(
            'Error loading wishlist:',
            error
          );


          this.alert.error(
            'Unable to load your wishlist.'
          );

        }

      });

  }


  // =========================
  // REMOVE FROM WISHLIST
  // =========================

  removeFromWishlist(
    item: any
  ): void {

    this.cartService
      .removeFromWishlist(item.id)
      .subscribe({

        next: () => {

          this.wishlistItems =
            this.wishlistItems.filter(
              wishlistItem =>
                wishlistItem.id !== item.id
            );


          this.alert.success(
            'Item removed from wishlist.'
          );

        },


        error: (error) => {

          console.error(
            'Error removing wishlist item:',
            error
          );


          if (error.error?.error) {

            this.alert.error(
              error.error.error
            );

          } else {

            this.alert.error(
              'Unable to remove item from wishlist.'
            );

          }

        }

      });

  }

}

export { Cart };


