import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cart } from '../services/cart';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class Wishlist implements OnInit {

  wishlistItems: any[] = [];

  constructor(private cartService: Cart) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {

    this.cartService.getWishlist().subscribe({

      next: (data) => {
        this.wishlistItems = data;
        console.log('Wishlist:', this.wishlistItems);
      },

      error: (error) => {
        console.error('Error loading wishlist:', error);
      }

    });

  }

  removeFromWishlist(item: any): void {

    this.cartService.removeFromWishlist(item.id).subscribe({

      next: () => {

        this.wishlistItems = this.wishlistItems.filter(
          wishlistItem => wishlistItem.id !== item.id
        );

      },

      error: (error) => {
        console.error('Error removing wishlist item:', error);
      }

    });

  }

}


