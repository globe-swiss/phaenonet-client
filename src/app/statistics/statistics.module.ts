import { NgModule } from '@angular/core';
import { MasterdataModule } from '../masterdata/masterdata.module';
import { ObservationModule } from '../observation/observation.module';
import { SharedModule } from '../shared/shared.module';
import { StatisticsOverviewComponent } from './statistics-overview.component';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { StatisticsComponent } from './statistics.component';
import { StatisticsService } from './statistics.service';

@NgModule({
  imports: [SharedModule, StatisticsRoutingModule, ObservationModule, MasterdataModule],
  declarations: [StatisticsComponent, StatisticsOverviewComponent],
  providers: [StatisticsService],
  exports: []
})
export class StatisticsModule {}
