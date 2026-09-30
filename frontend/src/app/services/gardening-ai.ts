import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class GardeningAi {

  private apiUrl = 'https://plantnurserymanagement.onrender.com/api/gardening-ai/ask/';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  askQuestion(question: string) {

    const headers = new HttpHeaders({
      'Authorization': `Token ${this.auth.getToken()}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(
      this.apiUrl,
      { question },
      { headers }
    );
  }
}


