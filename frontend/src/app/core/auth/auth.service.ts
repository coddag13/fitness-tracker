import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthenticationResponse } from '../../features/auth/models/authentication-response.model';
import { LoginRequest } from '../../features/auth/models/login-request.model';
import { RegisterRequest } from '../../features/auth/models/register-request.model';
import { API_BASE_URL } from '../config/api.config';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly currentUser = this.tokenStorage.user;
  readonly isAuthenticated = computed(() => this.tokenStorage.session() !== null);

  login(request: LoginRequest): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(`${this.apiBaseUrl}/auth/login`, request)
      .pipe(tap((response) => this.tokenStorage.save(response)));
  }

  register(request: RegisterRequest): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(`${this.apiBaseUrl}/auth/register`, request)
      .pipe(tap((response) => this.tokenStorage.save(response)));
  }

  logout(): void {
    this.tokenStorage.clear();
    void this.router.navigate(['/login']);
  }
}
