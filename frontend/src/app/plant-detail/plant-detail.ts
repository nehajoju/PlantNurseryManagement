import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlantService } from '../services/plant';
import { Cart } from '../services/cart';
import { AlertService } from '../services/alert';

@Component({
  selector: 'app-plant-detail',
  imports: [RouterLink],
  templateUrl: './plant-detail.html',
  styleUrl: './plant-detail.css'
})
export class PlantDetail implements OnInit {

  plant: any = null;
  isInCart: boolean = false;
  isInWishlist: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private plantService: PlantService,
    private cartService: Cart,
    private alert: AlertService
  ) { }

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.plantService.getPlant(id).subscribe({

      next: (data) => {
        this.plant = data;
        console.log('Plant details:', this.plant);

        this.checkIfInCart();
        this.checkIfInWishlist();
      },

      error: (error) => {
        console.error('Error loading plant:', error);
      }

    });

  }

  checkIfInCart(): void {

    this.cartService.getCart().subscribe({

      next: (cartItems) => {

        this.isInCart = cartItems.some(
          (item) => item.plant === this.plant.id
        );

      },

      error: (error) => {
        console.error('Error checking cart:', error);
      }

    });

  }

  checkIfInWishlist(): void {

    this.cartService.getWishlist().subscribe({

      next: (wishlistItems) => {

        this.isInWishlist = wishlistItems.some(
          (item) => item.plant === this.plant.id
        );

      },

      error: (error) => {
        console.error('Error checking wishlist:', error);
      }

    });

  }
  addToCart(): void {

    if (!this.plant) {
      return;
    }

    this.cartService.addToCart(this.plant.id, 1).subscribe({

      next: (response) => {

        console.log('Added to cart:', response);

        this.isInCart = true;

        this.alert.success('Plant added to cart!');

      },

      error: (error) => {

        console.error('Error adding to cart:', error);

        this.alert.error('Failed to add plant to cart.');

      }

    });

  }
  addToWishlist(): void {

  if (!this.plant) {
    return;
  }

  this.cartService.addToWishlist(this.plant.id).subscribe({

    next: (response) => {

      console.log('Added to wishlist:', response);

      this.isInWishlist = true;

      this.alert.success('Plant added to wishlist!');

    },

    error: (error) => {

      console.error('Error adding to wishlist:', error);

      this.alert.error('Failed to add plant to wishlist.');

    }

  });

}

}
