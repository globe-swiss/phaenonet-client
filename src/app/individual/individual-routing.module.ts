import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { IndividualConnectComponent } from './individual-connect/individual-connect.component';
import { IndividualDetailComponent } from './individual-detail/individual-detail.component';
import { IndividualEditComponent } from './individual-edit/individual-edit.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: ':id/connect', component: IndividualConnectComponent, canActivate: [AuthGuard] },
      { path: ':id/edit', component: IndividualEditComponent, canActivate: [AuthGuard] },
      { path: ':id', component: IndividualDetailComponent },
      { path: '', redirectTo: '/map', pathMatch: 'full' }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndividualRoutingModule {}
