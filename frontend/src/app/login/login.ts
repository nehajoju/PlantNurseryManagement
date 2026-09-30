
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../services/auth';
import { AlertService } from '../services/alert';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private auth: Auth,
    private alert: AlertService
  ) {

    this.loginForm = this.fb.group({

      username: ['', Validators.required],

      password: ['', Validators.required]

    });

  }


  login(): void {

    if (this.loginForm.invalid) {

      this.alert.warning('Please enter username and password.');

      return;
    }


    this.http.post<any>(
      'http://https://plantnurserymanagement.onrender.com/api/users/login/',
      this.loginForm.value
    ).subscribe({

      next: (response) => {

        console.log('Login response:', response);

        // Store the complete login session
        this.auth.setSession(response);

        this.alert.success('Login successful!');


        // Redirect according to role
        if (this.auth.isAdmin()) {

          this.router.navigate(['/admin']);

        } else if (this.auth.isStaff()) {

          this.router.navigate(['/staff']);

        } else {

          this.router.navigate(['/']);

        }

      },


      error: (error) => {

        console.log('Login error:', error);

        this.alert.error('Invalid username or password.');

      }

    });

  }

}