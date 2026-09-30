import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class PlantService {

  private apiUrl = 'https://plantnurserymanagement.onrender.com/api/plants/';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  // Get all plants
  getPlants(): Observable<any[]> {

    return this.http.get<any[]>(
      this.apiUrl
    );

  }


  // Get single plant
  getPlant(id: number): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}${id}/`
    );

  }


  // Get all categories
  getCategories(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}categories/`
    );

  }


  // Admin: Add plant
  createPlant(formData: FormData): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      this.apiUrl,
      formData,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );

  }


  // Admin: Update plant
  updatePlant(
    id: number,
    formData: FormData
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.patch<any>(
      `${this.apiUrl}${id}/`,
      formData,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );

  }


  // Admin: Delete plant
  deletePlant(id: number): Observable<any> {

    const token = this.auth.getToken();

    return this.http.delete<any>(
      `${this.apiUrl}${id}/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );

  }


  // Admin: Create category
  createCategory(name: string): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      `${this.apiUrl}categories/`,
      { name: name },
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );

  }


  // Admin: Update category
  updateCategory(
    id: number,
    name: string
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.patch<any>(
      `${this.apiUrl}categories/${id}/`,
      { name: name },
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );

  }


  // Admin: Delete category
  deleteCategory(id: number): Observable<any> {

    const token = this.auth.getToken();

    return this.http.delete<any>(
      `${this.apiUrl}categories/${id}/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );

  }

}


