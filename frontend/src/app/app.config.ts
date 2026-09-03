import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeSrLatn from '@angular/common/locales/sr-Latn';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './core/auth/auth.interceptor';
import { API_BASE_URL } from './core/config/api.config';
import { routes } from './app.routes';

registerLocaleData(localeSrLatn);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'sr-Latn' },
    {
      provide: API_BASE_URL,
      useValue: 'https://localhost:7088/api',
    },
  ],
};
