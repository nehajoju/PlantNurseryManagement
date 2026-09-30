import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class StaffResponsibilityService {

  private apiUrl =
    'http://127.0.0.1:8000/api/users/staff/responsibilities/';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  getResponsibilities(): Observable<any> {

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
}