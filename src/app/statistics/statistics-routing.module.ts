import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StatisticsOverviewComponent } from './statistics-overview.component';
import { StatisticsComponent } from './statistics.component';

const routes: Routes = [
  {
    path: '',
    component: StatisticsComponent,
    children: [{ path: '', component: StatisticsOverviewComponent }]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticsRoutingModule {}
