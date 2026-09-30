import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class Gardening {

  private apiUrl =
    'http://https://plantnurserymanagement.onrender.com/api/gardening/';

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {}

  // ==============================
  // ADMIN - TASK TYPES
  // ==============================

  getTaskTypes(): Observable<any> {

    const token = this.auth.getToken();

    return this.http.get<any>(
      `${this.apiUrl}admin/task-types/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }

  createTaskType(data: any): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      `${this.apiUrl}admin/task-types/`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }

  updateTaskType(
    taskTypeId: number,
    data: any
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.put<any>(
      `${this.apiUrl}admin/task-types/${taskTypeId}/`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }

  deleteTaskType(
    taskTypeId: number
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.delete<any>(
      `${this.apiUrl}admin/task-types/${taskTypeId}/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // ==============================
  // ADMIN - CARE SCHEDULES
  // ==============================

  getCareSchedules(): Observable<any> {

    const token = this.auth.getToken();

    return this.http.get<any>(
      `${this.apiUrl}admin/schedules/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }

  createCareSchedule(data: any): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      `${this.apiUrl}admin/schedules/`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }

  deleteCareSchedule(
    scheduleId: number
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.delete<any>(
      `${this.apiUrl}admin/schedules/${scheduleId}/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // ==============================
  // ADMIN - CARE TASKS
  // ==============================

  getAllCareTasks(): Observable<any> {

    const token = this.auth.getToken();

    return this.http.get<any>(
      `${this.apiUrl}admin/tasks/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // ==============================
  // ADMIN - CARE HISTORY
  // ==============================

  getCareHistory(): Observable<any> {

    const token = this.auth.getToken();

    return this.http.get<any>(
      `${this.apiUrl}admin/history/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // ==============================
  // STAFF - AVAILABLE TASKS
  // ==============================

  getAvailableTasks(): Observable<any> {

    const token = this.auth.getToken();

    return this.http.get<any>(
      `${this.apiUrl}staff/tasks/available/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // ==============================
  // STAFF - MY TASKS
  // ==============================

  getMyTasks(): Observable<any> {

    const token = this.auth.getToken();

    return this.http.get<any>(
      `${this.apiUrl}staff/tasks/my/`,
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // ==============================
  // STAFF - CLAIM TASK
  // ==============================

  claimTask(
    taskId: number
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      `${this.apiUrl}staff/tasks/${taskId}/claim/`,
      {},
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // ==============================
  // STAFF - START TASK
  // ==============================

  startTask(
    taskId: number
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      `${this.apiUrl}staff/tasks/${taskId}/start/`,
      {},
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // ==============================
  // STAFF - COMPLETE TASK
  // ==============================

  completeTask(
    taskId: number,
    staffNotes: string = ''
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      `${this.apiUrl}staff/tasks/${taskId}/complete/`,
      {
        staff_notes: staffNotes
      },
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }


  // ==============================
  // STAFF - SKIP TASK
  // ==============================

  skipTask(
    taskId: number,
    skipReason: string
  ): Observable<any> {

    const token = this.auth.getToken();

    return this.http.post<any>(
      `${this.apiUrl}staff/tasks/${taskId}/skip/`,
      {
        skip_reason: skipReason
      },
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
  }
}