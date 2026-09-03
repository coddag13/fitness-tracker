import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  return tokenStorage.hasActiveSession()
    ? true
    : router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
};

export const guestGuard: CanActivateFn = () => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  return tokenStorage.hasActiveSession()
    ? router.createUrlTree(['/dashboard'])
    : true;
};
