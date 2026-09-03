import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
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
