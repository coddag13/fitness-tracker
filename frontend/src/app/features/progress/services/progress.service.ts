import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { MonthlyProgress } from '../models/progress.model';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getMonthly(year: number, month: number): Observable<MonthlyProgress> {
    const params = new HttpParams().set('year', year).set('month', month);

    return this.http.get<MonthlyProgress>(`${this.apiBaseUrl}/progress/monthly`, {
      params,
    });
  }
}
