import { Routes } from '@angular/router';
import { AuthGuard } from './core/providers/auth.guard';

import { LoadingGuard } from './core/providers/loading.guard';

export const LOGIN_URL = '/auth/login';
export const LOGGED_OUT_URL = '/auth/logged-out';

export const routes: Routes = [
  {
    path: '',
    canActivate: [LoadingGuard],
    data: {},
    children: [
      {
        path: 'individuals',
        children: [
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./domains/individual/feature-edit/individual-edit.page').then(m => m.IndividualEditComponent),
            canActivate: [AuthGuard]
          },
          {
            path: ':id',
            loadComponent: () => import('./domains/individual/individual.page').then(m => m.IndividualDetailComponent)
          },
          { path: '', redirectTo: '/map', pathMatch: 'full' }
        ]
      },
      {
        path: 'stations',
        children: [
          {
            path: ':id',
            loadComponent: () => import('./domains/individual/station.page').then(m => m.StationComponent)
          },
          { path: '', redirectTo: '/map', pathMatch: 'full' } // Redirects to /map if no ID is provided
        ]
      },
      {
        path: 'map',
        children: [
          { path: '', loadComponent: () => import('./domains/map/map.page').then(m => m.MapComponent) },
          { path: '**', redirectTo: '/map', pathMatch: 'full' }
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: 'invites',
            loadComponent: () => import('./domains/profile/feature-invite/invite.widget').then(m => m.InviteComponent),
            canActivate: [AuthGuard]
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./domains/profile/feature-profile-edit/profile-edit.page').then(m => m.ProfileEditComponent),
            canActivate: [AuthGuard]
          },
          {
            path: ':id/species/:species/year/:year',
            loadComponent: () =>
              import('./domains/profile/feature-observations/observation-species.page').then(
                m => m.ProfileSpeciesComponent
              )
          },
          { path: ':id', loadComponent: () => import('./domains/profile/profile.page').then(m => m.ProfileComponent) },
          {
            path: '',
            loadComponent: () => import('./domains/profile/profile.page').then(m => m.ProfileComponent),
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'statistics',
        loadComponent: () => import('./domains/statistics/statistics.page').then(m => m.StatisticsComponent)
      },
      {
        path: '',
        redirectTo: '/map',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./domains/auth/login.page').then(m => m.LoginComponent) },
      {
        path: 'logged-out',
        loadComponent: () => import('./domains/auth/logged-out.page').then(m => m.LoggedOutComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./domains/auth/reset-password.page').then(m => m.ResetPasswordComponent)
      },
      { path: 'register', loadComponent: () => import('./domains/auth/register.page').then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'login',
    redirectTo: LOGIN_URL,
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () => import('./core/components/not-found.page').then(m => m.NotFoundComponent)
  }
];
