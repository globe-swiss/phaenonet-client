import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map.component';
import { MapOverviewComponent } from './map-overview.component';

const routes: Routes = [
  {
    path: '',
    component: MapComponent,
    children: [{ path: '', component: MapOverviewComponent }]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapRoutingModule {}
