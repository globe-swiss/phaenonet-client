import { Routes } from '@angular/router';
import { NotFoundComponent } from './core/components/not-found.page';
import { AuthGuard } from './core/providers/auth.guard';
import { LoadingGuard } from './core/providers/loading.guard';
import { LoggedOutComponent } from './domains/auth/logged-out.page';
import { LoginComponent } from './domains/auth/login.page';
import { RegisterComponent } from './domains/auth/register.page';
import { ResetPasswordComponent } from './domains/auth/reset-password.page';
import { IndividualEditComponent } from './domains/individual/feature-edit/individual-edit.page';
import { IndividualDetailComponent } from './domains/individual/individual.page';
import { StationComponent } from './domains/individual/station.page';
import { MapComponent } from './domains/map/map.page';
import { InviteComponent } from './domains/profile/feature-invite/invite.widget';
import { ProfileSpeciesComponent } from './domains/profile/feature-observations/profile-species.page';
import { ProfileEditComponent } from './domains/profile/feature-profile-edit/profile-edit.page';
import { ProfileComponent } from './domains/profile/profile.page';
import { StatisticsComponent } from './domains/statistics/statistics.page';

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
          { path: ':id/edit', component: IndividualEditComponent, canActivate: [AuthGuard] },
          { path: ':id', component: IndividualDetailComponent },
          { path: '', redirectTo: '/map', pathMatch: 'full' }
        ]
      },
      {
        path: 'stations',
        children: [
          { path: ':id', component: StationComponent },
          { path: '', redirectTo: '/map', pathMatch: 'full' } // Redirects to /map if no ID is provided
        ]
      },
      {
        path: 'map',
        children: [
          { path: '', component: MapComponent },
          { path: '**', redirectTo: '/map', pathMatch: 'full' }
        ]
      },
      {
        path: 'profile',
        children: [
          { path: 'invites', component: InviteComponent, canActivate: [AuthGuard] },
          { path: ':id/edit', component: ProfileEditComponent, canActivate: [AuthGuard] },
          { path: ':id/species/:species/year/:year', component: ProfileSpeciesComponent },
          { path: ':id', component: ProfileComponent },
          { path: '', component: ProfileComponent, canActivate: [AuthGuard] }
        ]
      },
      {
        path: 'statistics',
        component: StatisticsComponent
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
      { path: 'login', component: LoginComponent },
      { path: 'logged-out', component: LoggedOutComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'register', component: RegisterComponent },
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
    component: NotFoundComponent
  }
];
