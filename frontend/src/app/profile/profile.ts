
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserService } from '../services/user';
import { AlertService } from '../services/alert';

@Component({
  selector: 'app-profile',

  imports: [
    FormsModule
  ],

  templateUrl: './profile.html',

  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  user: any = null;

  editUser: any = null;

  loading = true;

  editMode = false;

  saving = false;


  constructor(
    private userService: UserService,
    private alert: AlertService
  ) {}


  // =========================================
  // LOAD PROFILE
  // =========================================

  ngOnInit(): void {

    this.loadProfile();

  }


  loadProfile(): void {

    this.loading = true;

    this.userService.getProfile().subscribe({

      next: (data) => {

        this.user = data;

        this.loading = false;

        console.log(
          'User Profile:',
          this.user
        );

      },


      error: (error) => {

        console.error(
          'Error loading profile:',
          error
        );

        this.loading = false;

        this.alert.error(
          'Unable to load your profile.'
        );

      }

    });

  }


  // =========================================
  // START EDIT
  // =========================================

  startEdit(): void {

    this.editUser = {
      ...this.user
    };

    this.editMode = true;

  }


  // =========================================
  // CANCEL EDIT
  // =========================================

  cancelEdit(): void {

    this.editUser = null;

    this.editMode = false;

  }


  // =========================================
  // SAVE PROFILE
  // =========================================

  saveProfile(): void {

    if (!this.editUser) {

      return;

    }


    // =========================================
    // EMAIL VALIDATION
    // =========================================

    if (
      !this.editUser.email ||
      !this.editUser.email.trim()
    ) {

      this.alert.error(
        'Email is required.'
      );

      return;

    }


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(
        this.editUser.email.trim()
      )
    ) {

      this.alert.error(
        'Please enter a valid email address.'
      );

      return;

    }


    // =========================================
    // PHONE VALIDATION
    // =========================================

    if (
      !this.editUser.phone ||
      !this.editUser.phone.trim()
    ) {

      this.alert.error(
        'Phone number is required.'
      );

      return;

    }


    const phonePattern =
      /^[6-9]\d{9}$/;


    if (
      !phonePattern.test(
        this.editUser.phone.trim()
      )
    ) {

      this.alert.error(
        'Please enter a valid 10-digit phone number.'
      );

      return;

    }


    // =========================================
    // ADDRESS VALIDATION
    // =========================================

    if (
      !this.editUser.address ||
      !this.editUser.address.trim()
    ) {

      this.alert.error(
        'Address is required.'
      );

      return;

    }


    // =========================================
    // CITY VALIDATION
    // =========================================

    if (
      !this.editUser.city ||
      !this.editUser.city.trim()
    ) {

      this.alert.error(
        'City is required.'
      );

      return;

    }


    // =========================================
    // STATE VALIDATION
    // =========================================

    if (
      !this.editUser.state ||
      !this.editUser.state.trim()
    ) {

      this.alert.error(
        'State is required.'
      );

      return;

    }


    // =========================================
    // PINCODE VALIDATION
    // =========================================

    if (
      !this.editUser.pincode ||
      !this.editUser.pincode.trim()
    ) {

      this.alert.error(
        'Pincode is required.'
      );

      return;

    }


    const pincodePattern =
      /^\d{6}$/;


    if (
      !pincodePattern.test(
        this.editUser.pincode.trim()
      )
    ) {

      this.alert.error(
        'Please enter a valid 6-digit pincode.'
      );

      return;

    }


    // =========================================
    // START SAVING
    // =========================================

    this.saving = true;


    // =========================================
    // DATA SENT TO BACKEND
    // =========================================

    const profileData = {

      email:
        this.editUser.email.trim(),

      phone:
        this.editUser.phone.trim(),

      address:
        this.editUser.address.trim(),

      city:
        this.editUser.city.trim(),

      state:
        this.editUser.state.trim(),

      pincode:
        this.editUser.pincode.trim()

    };


    console.log(
      'Updating profile:',
      profileData
    );


    // =========================================
    // UPDATE PROFILE API
    // =========================================

    this.userService
      .updateProfile(profileData)
      .subscribe({

        next: (response) => {

          console.log(
            'Profile updated:',
            response
          );


          // Update displayed user

          this.user =
            response.user;


          // Exit edit mode

          this.editUser = null;

          this.editMode = false;


          // Stop saving

          this.saving = false;


          // Success message

          this.alert.success(
            'Profile updated successfully! 🌿'
          );

        },


        error: (error) => {

          console.error(
            'Error updating profile:',
            error
          );


          this.saving = false;


          // Backend error message if available

          if (
            error?.error?.error
          ) {

            this.alert.error(
              error.error.error
            );

          }

          else if (
            error?.error?.message
          ) {

            this.alert.error(
              error.error.message
            );

          }

          else {

            this.alert.error(
              'Unable to update profile.'
            );

          }

        }

      });

  }

}
