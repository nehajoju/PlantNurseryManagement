import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://https://plantnurserymanagement.onrender.com/api/users/profile/';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  // =========================
  // GET PROFILE
  // =========================

  getProfile(): Observable<any> {

    const token = this.auth.getToken();

    return this.http.get<any>(
      this.apiUrl,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // =========================
  // UPDATE PROFILE
  // =========================

  updateProfile(userData: any): Observable<any> {

    const token = this.auth.getToken();

    return this.http.put<any>(
      this.apiUrl,
      userData,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }
}