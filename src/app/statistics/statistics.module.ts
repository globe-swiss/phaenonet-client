import { NgModule } from '@angular/core';

import { StatisticsOverviewComponent } from './statistics-overview.component';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { StatisticsComponent } from './statistics.component';

@NgModule({
  imports: [StatisticsRoutingModule, StatisticsComponent, StatisticsOverviewComponent],
  exports: []
})
export class StatisticsModule {}
