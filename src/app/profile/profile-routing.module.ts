import { AuthGuard } from './../auth/auth-guard.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: ':id', component: ProfileComponent },
      { path: '', component: ProfileComponent, canActivate: [AuthGuard] },
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
