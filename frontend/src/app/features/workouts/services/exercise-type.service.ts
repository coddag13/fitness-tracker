import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ExerciseType } from '../models/exercise-type.model';

@Injectable({ providedIn: 'root' })
export class ExerciseTypeService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getAll(): Observable<ExerciseType[]> {
    return this.http.get<ExerciseType[]>(`${this.apiBaseUrl}/exercise-types`);
  }
}
