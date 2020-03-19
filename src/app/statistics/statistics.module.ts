import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ObservationModule } from '../observation/observation.module';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { StatisticsComponent } from './statistics.component';
import { StatisticsOverviewComponent } from './statistics-overview.component';
import { MasterdataModule } from '../masterdata/masterdata.module';
import { StatisticsService } from './statistics.service';

@NgModule({
  imports: [SharedModule, StatisticsRoutingModule, ObservationModule, MasterdataModule],
  declarations: [StatisticsComponent, StatisticsOverviewComponent],
  providers: [StatisticsService],
  exports: []
})
export class StatisticsModule {}
