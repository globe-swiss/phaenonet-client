import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { InviteComponent } from './invite/invite.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ProfileSpeciesComponent } from './profile/profile-species.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'invites', component: InviteComponent, canActivate: [AuthGuard] },
      { path: ':id', component: ProfileComponent },
      { path: '', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: ':id/edit', component: ProfileEditComponent, canActivate: [AuthGuard] },
      { path: ':id/species/:species', component: ProfileSpeciesComponent },
      { path: ':id/species/:species/year/:year', component: ProfileSpeciesComponent },
      { path: '', redirectTo: '', pathMatch: 'full' }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}
