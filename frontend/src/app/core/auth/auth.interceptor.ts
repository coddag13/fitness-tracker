import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { TokenStorageService } from './token-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = inject(API_BASE_URL);
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.accessToken();
  const isApiRequest = request.url.startsWith(apiBaseUrl);
  const isAuthenticationRequest = request.url.includes('/auth/');

  const authorizedRequest =
    token && isApiRequest
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        isApiRequest &&
        !isAuthenticationRequest
      ) {
        tokenStorage.clear();
        void router.navigate(['/login'], {
          queryParams: { sessionExpired: true },
        });
      }

      return throwError(() => error);
    }),
  );
};
