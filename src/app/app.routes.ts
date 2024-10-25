import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth-guard.service';
import { NotFoundComponent } from './core/not-found.component';
import { IndividualDetailComponent } from './individual/individual-detail/individual-detail.component';
import { IndividualEditComponent } from './individual/individual-edit/individual-edit.component';
import { LoggedOutComponent } from './login/logged-out.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './login/register.component';
import { ResetPasswordComponent } from './login/reset-password.component';
import { MapOverviewComponent } from './map/map-overview.component';
import { InviteComponent } from './profile/invite/invite.component';
import { ProfileEditComponent } from './profile/profile-edit/profile-edit.component';
import { ProfileSpeciesComponent } from './profile/profile/profile-species.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { LoadingGuard } from './shared/LoadingGuard';
import { StationComponent } from './station/station.component';
import { StatisticsComponent } from './statistics/statistics.component';

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
          { path: '', component: MapOverviewComponent },
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
