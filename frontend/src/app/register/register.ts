import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  registerForm: FormGroup;

  errorMessage = '';
  successMessage = '';

  submitted = false;

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {

    this.registerForm = this.fb.group({

      first_name: ['', Validators.required],

      last_name: ['', Validators.required],

      username: ['', Validators.required],

      email: ['', [
        Validators.required,
        Validators.email
      ]],

      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
        )
      ]],

      confirm_password: ['', Validators.required],

      address: ['', Validators.required],

      city: ['', Validators.required],

      state: ['', Validators.required],

      pincode: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{6}$/)
      ]]

    });


    // Remove username server error when username changes
    this.registerForm.get('username')?.valueChanges.subscribe(() => {

      const field = this.registerForm.get('username');

      if (field?.hasError('serverError')) {

        const errors = {
          ...(field.errors || {})
        };

        delete errors['serverError'];

        field.setErrors(
          Object.keys(errors).length > 0
            ? errors
            : null
        );
      }

    });


    // Remove email server error when email changes
    this.registerForm.get('email')?.valueChanges.subscribe(() => {

      const field = this.registerForm.get('email');

      if (field?.hasError('serverError')) {

        const errors = {
          ...(field.errors || {})
        };

        delete errors['serverError'];

        field.setErrors(
          Object.keys(errors).length > 0
            ? errors
            : null
        );
      }

    });


    // Check password matching while typing
    this.registerForm.valueChanges.subscribe(() => {

      const password =
        this.registerForm.get('password')?.value;

      const confirmPassword =
        this.registerForm.get('confirm_password')?.value;

      const confirmField =
        this.registerForm.get('confirm_password');


      if (
        password &&
        confirmPassword &&
        password !== confirmPassword
      ) {

        const existingErrors =
          confirmField?.errors || {};

        confirmField?.setErrors({
          ...existingErrors,
          passwordMismatch: true
        });

      } else if (
        confirmField?.hasError('passwordMismatch')
      ) {

        const errors = {
          ...(confirmField.errors || {})
        };

        delete errors['passwordMismatch'];

        confirmField.setErrors(
          Object.keys(errors).length > 0
            ? errors
            : null
        );
      }

    });

  }


  register(): void {

    this.submitted = true;

    this.errorMessage = '';
    this.successMessage = '';

    this.registerForm.markAllAsTouched();


    if (this.registerForm.invalid) {

      this.errorMessage =
        'Please correct the highlighted fields.';

      return;
    }


    const password =
      this.registerForm.get('password')?.value;

    const confirmPassword =
      this.registerForm.get('confirm_password')?.value;


    if (password !== confirmPassword) {

      this.registerForm
        .get('confirm_password')
        ?.setErrors({
          passwordMismatch: true
        });

      this.registerForm
        .get('confirm_password')
        ?.markAsTouched();

      return;
    }


    this.http.post(
      'http://127.0.0.1:8000/api/users/register/',
      this.registerForm.value
    )
    .subscribe({

      // =========================
      // SUCCESS
      // =========================
      next: (response: any) => {

        console.log(
          'Registration successful:',
          response
        );

        this.errorMessage = '';

        this.successMessage =
          'Registration successful! Redirecting to login...';

        this.registerForm.reset();

        this.submitted = false;

        this.showPassword = false;

        this.showConfirmPassword = false;


        // Redirect to login after 1 second
        setTimeout(() => {

          this.router.navigate(['/login']);

        }, 1000);

      },


      // =========================
      // ERROR
      // =========================
      error: (error) => {

        console.log(
          'Registration error:',
          error
        );

        console.log(
          'Backend response:',
          error.error
        );

        this.errorMessage = '';


        // Username already exists
        if (error.error?.username) {

          const field =
            this.registerForm.get('username');

          field?.setErrors({
            ...(field.errors || {}),
            serverError: true
          });

          field?.markAsTouched();

          return;
        }


        // Email error
        if (error.error?.email) {

          const field =
            this.registerForm.get('email');

          field?.setErrors({
            ...(field.errors || {}),
            serverError: true
          });

          field?.markAsTouched();

          return;
        }


        // Password confirmation error
        if (error.error?.confirm_password) {

          const field =
            this.registerForm.get('confirm_password');

          field?.setErrors({
            ...(field.errors || {}),
            passwordMismatch: true
          });

          field?.markAsTouched();

          return;
        }


        // Other backend error
        if (error.error) {

          const messages: string[] = [];

          Object.keys(error.error).forEach((key) => {

            const value = error.error[key];

            /*
             * Only use actual text messages.
             * Do NOT display true/false.
             */
            if (Array.isArray(value)) {

              value.forEach((message: any) => {

                if (
                  typeof message === 'string'
                ) {

                  messages.push(message);

                }

              });

            } else if (
              typeof value === 'string'
            ) {

              messages.push(value);
            }

          });


          if (messages.length > 0) {

            this.errorMessage =
              messages.join(' ');

          } else {

            this.errorMessage =
              'Registration failed. Please check your details.';
          }

          return;
        }


        this.errorMessage =
          'Registration failed. Please try again.';
      }

    });

  }


  isInvalid(fieldName: string): boolean {

    const field =
      this.registerForm.get(fieldName);

    if (!field) {
      return false;
    }

    return (
      field.invalid &&
      (
        field.touched ||
        this.submitted
      )
    );
  }


  getPasswordMismatch(): boolean {

    const password =
      this.registerForm.get('password')?.value;

    const confirmPassword =
      this.registerForm.get('confirm_password')?.value;

    if (
      !password ||
      !confirmPassword
    ) {

      return false;
    }

    return password !== confirmPassword;
  }


  togglePassword(): void {

    this.showPassword =
      !this.showPassword;
  }


  toggleConfirmPassword(): void {

    this.showConfirmPassword =
      !this.showConfirmPassword;
  }

}