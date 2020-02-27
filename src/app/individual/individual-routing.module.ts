import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndividualEditComponent } from './individual-edit.component';
import { IndividualDetailComponent } from './individual-detail.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: ':id/edit', component: IndividualEditComponent },
      { path: ':id', component: IndividualDetailComponent },
      { path: '', redirectTo: 'individuals', pathMatch: 'full' }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndividualRoutingModule {}
