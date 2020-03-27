import { AuthGuard } from './../auth/auth-guard.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileDetailComponent } from './profile-detail.component';
import { ProfileEditComponent } from './profile-edit.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: ':id', component: ProfileDetailComponent },
      { path: '', component: ProfileDetailComponent },
      { path: ':id/edit', component: ProfileEditComponent, canActivate: [AuthGuard] },
      { path: '', redirectTo: '', pathMatch: 'full' }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}
