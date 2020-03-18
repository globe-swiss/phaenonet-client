import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StationDetailComponent } from './station-detail.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: ':id', component: StationDetailComponent },
      { path: '', redirectTo: 'stations', pathMatch: 'full' }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StationRoutingModule {}
