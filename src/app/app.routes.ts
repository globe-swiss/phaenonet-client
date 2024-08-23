import { Routes } from '@angular/router';
import { LOGIN_URL } from './auth/auth.service';
import { NotFoundComponent } from './core/not-found.component';
import { IndividualDetailComponent } from './individual/individual-detail/individual-detail.component';
import { LoginComponent } from './login/login.component';
import { MapOverviewComponent } from './map/map-overview.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { LoadingGuard } from './shared/LoadingGuard';
import { StationDetailComponent } from './station/station-detail.component';
import { StatisticsComponent } from './statistics/statistics.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [LoadingGuard],
    data: {},
    children: [
      {
        path: 'individuals',
        component: IndividualDetailComponent
      },
      {
        path: 'stations',
        component: StationDetailComponent
      },
      {
        path: 'map',
        component: MapOverviewComponent
      },
      {
        path: 'statistics',
        component: StatisticsComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
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
    component: LoginComponent
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
