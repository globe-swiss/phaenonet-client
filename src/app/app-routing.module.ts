import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/auth-guard.service';
import { RoleGuard } from './auth/role-guard.service';
import { LOGIN_URL } from './auth/auth.service';
import { NotFoundComponent } from './core/not-found.component';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [AuthGuard, RoleGuard],
    data: { roles: ['USER'] },
    children: [
      {
        path: 'objects',
        loadChildren: () => import('./object/object.module').then(m => m.ObjectModule)
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
        path: 'me',
        loadChildren: () => import('./currentuser/current-user.module').then(m => m.CurrentUserModule)
      },
      {
        path: '',
        redirectTo: '/observations',
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
