import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileDetailComponent } from './profile-detail.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: ':id', component: ProfileDetailComponent },
      { path: '', component: ProfileDetailComponent },
      { path: '', redirectTo: '', pathMatch: 'full' }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}
