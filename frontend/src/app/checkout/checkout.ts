import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Cart } from '../services/cart';
import { DatePipe } from '@angular/common';
import { Auth } from '../services/auth';
import { AlertService } from '../services/alert';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  imports: [
    FormsModule,
    RouterLink,
    DatePipe
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  cartItems: any[] = [];

  shippingAddress = '';
  city = '';
  state = '';
  pincode = '';

  totalAmount = 0;

  paymentMethod = 'COD';

  orderSuccess = false;

  orderDetails: any = null;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private cartService: Cart,
    private router: Router,
    private auth: Auth,
    private alert: AlertService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadCart();

    // Load previously saved address details
    this.loadSavedAddress();

  }


  // =====================================================
  // LOAD SAVED ADDRESS
  // =====================================================

  loadSavedAddress(): void {

    const token = this.auth.getToken();

    if (!token) {
      return;
    }

    this.cartService
      .getUserProfile()
      .subscribe({

        next: (profile: any) => {

          // Fill the checkout fields with saved values.
          // These fields remain editable because they are
          // connected to [(ngModel)] in checkout.html.

          this.shippingAddress =
            profile?.address || '';

          this.city =
            profile?.city || '';

          this.state =
            profile?.state || '';

          this.pincode =
            profile?.pincode || '';

        },

        error: (error) => {

          console.error(
            'Error loading saved address:',
            error
          );

          // Don't stop checkout if profile loading fails.
          // User can still enter the address manually.

        }

      });

  }


  // =====================================================
  // LOAD CART
  // =====================================================

  loadCart(): void {

    this.cartService.getCart().subscribe({

      next: (data) => {

        this.cartItems = data;

        this.calculateTotal();

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


  // =====================================================
  // CALCULATE TOTAL
  // =====================================================

  calculateTotal(): void {

    this.totalAmount = this.cartItems.reduce(

      (total, item) =>

        total +
        (
          Number(item.plant_price) *
          Number(item.quantity)
        ),

      0

    );

  }


  // =====================================================
  // TEMPLATE VALIDATION HELPERS
  // =====================================================

  isCityInvalid(): boolean {

    if (!this.city.trim()) {
      return false;
    }

    return !/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(
      this.city.trim()
    );

  }


  isStateInvalid(): boolean {

    if (!this.state.trim()) {
      return false;
    }

    return !/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(
      this.state.trim()
    );

  }


  isPincodeInvalid(): boolean {

    if (!this.pincode.trim()) {
      return false;
    }

    return !/^\d{6}$/.test(
      this.pincode.trim()
    );

  }


  isAddressInvalid(): boolean {

    if (!this.shippingAddress.trim()) {
      return false;
    }

    return this.shippingAddress.trim().length < 10;

  }


  // =====================================================
  // CHECKOUT VALIDATION
  // =====================================================

  validateCheckout(): boolean {

    // -------------------------------------------------
    // SHIPPING ADDRESS
    // -------------------------------------------------

    this.shippingAddress =
      this.shippingAddress.trim();

    if (!this.shippingAddress) {

      this.alert.warning(
        'Please enter your shipping address.'
      );

      return false;

    }

    if (this.shippingAddress.length < 10) {

      this.alert.warning(
        'Please enter a complete delivery address.'
      );

      return false;

    }


    // -------------------------------------------------
    // CITY
    // -------------------------------------------------

    this.city =
      this.city.trim();

    if (!this.city) {

      this.alert.warning(
        'Please enter your city.'
      );

      return false;

    }

    if (
      !/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(
        this.city
      )
    ) {

      this.alert.warning(
        'City should contain letters and spaces only.'
      );

      return false;

    }


    // -------------------------------------------------
    // STATE
    // -------------------------------------------------

    this.state =
      this.state.trim();

    if (!this.state) {

      this.alert.warning(
        'Please enter your state.'
      );

      return false;

    }

    if (
      !/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/.test(
        this.state
      )
    ) {

      this.alert.warning(
        'State should contain letters and spaces only.'
      );

      return false;

    }


    // -------------------------------------------------
    // PINCODE
    // -------------------------------------------------

    this.pincode =
      this.pincode.trim();

    if (!this.pincode) {

      this.alert.warning(
        'Please enter your pincode.'
      );

      return false;

    }

    if (
      !/^\d{6}$/.test(
        this.pincode
      )
    ) {

      this.alert.warning(
        'Pincode must contain exactly 6 digits.'
      );

      return false;

    }


    // -------------------------------------------------
    // PAYMENT METHOD
    // -------------------------------------------------

    if (
      this.paymentMethod !== 'COD' &&
      this.paymentMethod !== 'UPI'
    ) {

      this.alert.warning(
        'Please select a payment method.'
      );

      return false;

    }


    // -------------------------------------------------
    // CART
    // -------------------------------------------------

    if (
      !this.cartItems ||
      this.cartItems.length === 0
    ) {

      this.alert.warning(
        'Your cart is empty.'
      );

      return false;

    }


    return true;

  }


  // =====================================================
  // PINCODE
  // =====================================================

  allowPincodeNumbers(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    let value =
      input.value.replace(/\D/g, '');

    if (value.length > 6) {

      value =
        value.substring(0, 6);

    }

    input.value =
      value;

    this.pincode =
      value;

  }


  // =====================================================
  // RAZORPAY PAYMENT
  // =====================================================

  openRazorpay(): void {

    this.cartService
      .createRazorpayOrder()
      .subscribe({

        next: (response: any) => {

          console.log(
            'Razorpay order:',
            response
          );


          const options = {

            key:
              response.key_id,

            amount:
              response.amount,

            currency:
              response.currency,

            name:
              'PlantNest',

            description:
              'Plant Nursery Order',

            order_id:
              response.razorpay_order_id,


            // -----------------------------------------
            // PAYMENT SUCCESS
            // -----------------------------------------

            handler: (paymentResponse: any) => {

              console.log(
                'Payment successful:',
                paymentResponse
              );


              const paymentData = {

                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,

                shipping_address:
                  this.shippingAddress.trim(),

                city:
                  this.city.trim(),

                state:
                  this.state.trim(),

                pincode:
                  this.pincode.trim()

              };


              this.cartService
                .verifyRazorpayPayment(
                  paymentData
                )
                .subscribe({

                  next: (response: any) => {

                    console.log(
                      'Payment verified:',
                      response
                    );


                    this.alert.success(
                      'Payment successful and verified! 🌱'
                    );


                    this.orderSuccess =
                      true;

                    this.orderDetails =
                      response.order;

                  },


                  error: (error) => {

                    console.error(
                      'Payment verification failed:',
                      error
                    );


                    this.alert.error(
                      'Payment verification failed. Please contact support.'
                    );

                  }

                });

            },


            // -----------------------------------------
            // CUSTOMER DETAILS
            // -----------------------------------------

            prefill: {

              name:
                this.auth.getUsername(),

              email:
                this.auth.getEmail()

            },


            // -----------------------------------------
            // RAZORPAY THEME
            // -----------------------------------------

            theme: {

              color:
                '#2f6b3f'

            }

          };


          const razorpay =
            new Razorpay(options);

          razorpay.open();

        },


        error: (error) => {

          console.error(
            'Error creating Razorpay order:',
            error
          );


          if (error.error?.error) {

            this.alert.error(
              error.error.error
            );

          } else {

            this.alert.error(
              'Unable to start payment.'
            );

          }

        }

      });

  }


  // =====================================================
  // PLACE ORDER
  // =====================================================

  placeOrder(): void {

    // Validate everything first

    if (!this.validateCheckout()) {

      return;

    }


    // =================================================
    // COD
    // =================================================

    if (
      this.paymentMethod === 'COD'
    ) {


      const orderData = {

        shipping_address:
          this.shippingAddress.trim(),

        city:
          this.city.trim(),

        state:
          this.state.trim(),

        pincode:
          this.pincode.trim(),

        payment_method:
          'COD'

      };


      this.cartService
        .createOrder(orderData)
        .subscribe({

          next: (response: any) => {

            console.log(
              'COD Order placed:',
              response
            );


            this.alert.success(
              'Order placed successfully! 🌱'
            );


            this.orderSuccess =
              true;

            this.orderDetails =
              response;

          },


          error: (error) => {

            console.error(
              'Error placing COD order:',
              error
            );


            if (error.error?.error) {

              this.alert.error(
                error.error.error
              );

            } else {

              this.alert.error(
                'Failed to place order.'
              );

            }

          }

        });

    }


    // =================================================
    // UPI / RAZORPAY
    // =================================================

    else if (
      this.paymentMethod === 'UPI'
    ) {

      this.openRazorpay();

    }

  }


  // =====================================================
  // DOWNLOAD RECEIPT
  // =====================================================

  downloadReceipt(): void {

    if (!this.orderDetails) {

      return;

    }


    const orderId =
      this.orderDetails.id;


    this.cartService
      .downloadReceipt(orderId)
      .subscribe({

        next: (pdf: Blob) => {

          const url =
            window.URL.createObjectURL(
              pdf
            );


          const link =
            document.createElement('a');


          link.href =
            url;


          link.download =
            `PlantNest_Order_${orderId}.pdf`;


          link.click();


          window.URL.revokeObjectURL(
            url
          );

        },


        error: (error) => {

          console.error(
            'Error downloading receipt:',
            error
          );


          this.alert.error(
            'Unable to download receipt.'
          );

        }

      });

  }

}
