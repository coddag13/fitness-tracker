import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { Workout } from '../models/workout.model';
import { WorkoutRequest } from '../models/workout-request.model';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getAll(): Observable<Workout[]> {
    return this.http.get<Workout[]>(`${this.apiBaseUrl}/workouts`);
  }

  create(request: WorkoutRequest): Observable<Workout> {
    return this.http.post<Workout>(`${this.apiBaseUrl}/workouts`, request);
  }

  update(id: number, request: WorkoutRequest): Observable<Workout> {
    return this.http.put<Workout>(`${this.apiBaseUrl}/workouts/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/workouts/${id}`);
  }
}
