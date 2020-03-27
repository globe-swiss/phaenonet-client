import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/auth-guard.service';
import { LOGIN_URL } from './auth/auth.service';
import { NotFoundComponent } from './core/not-found.component';

const routes: Routes = [
  {
    path: '',
    data: {},
    children: [
      {
        path: 'individuals',
        loadChildren: () => import('./individual/individual.module').then(m => m.IndividualModule)
      },
      {
        path: 'stations',
        loadChildren: () => import('./station/station.module').then(m => m.StationModule)
      },
      {
        path: 'observations',
        loadChildren: () => import('./observation/observation.module').then(m => m.ObservationModule)
      },
      {
        path: 'map',
        loadChildren: () => import('./map/map.module').then(m => m.MapModule)
      },
      {
        path: 'statistics',
        loadChildren: () => import('./statistics/statistics.module').then(m => m.StatisticsModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
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
      {
        path: '',
        loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
      }
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
