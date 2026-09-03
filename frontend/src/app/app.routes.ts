import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Prijava | FitnessTracker',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page').then(
        (component) => component.LoginPage,
      ),
  },
  {
    path: 'register',
    title: 'Registracija | FitnessTracker',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/register-page/register-page').then(
        (component) => component.RegisterPage,
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/app-shell/app-shell').then(
        (component) => component.AppShell,
      ),
    children: [
      {
        path: 'dashboard',
        title: 'Pregled | FitnessTracker',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page').then(
            (component) => component.DashboardPage,
          ),
      },
      {
        path: 'workouts',
        title: 'Treninzi | FitnessTracker',
        loadComponent: () =>
          import('./features/workouts/pages/workouts-page/workouts-page').then(
            (component) => component.WorkoutsPage,
          ),
      },
      {
        path: 'progress',
        title: 'Napredak | FitnessTracker',
        loadComponent: () =>
          import('./features/progress/pages/progress-page/progress-page').then(
            (component) => component.ProgressPage,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
