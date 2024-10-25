import { NgModule } from '@angular/core';
import { ActivityModule } from '../activity/activity.module';
import { IndividualModule } from '../individual/individual.module';
import { SharedModule } from '../shared/shared.module';
import { StationDetailComponent } from './station-detail.component';
import { StationRoutingModule } from './station-routing.module';

@NgModule({
  imports: [SharedModule, StationRoutingModule, IndividualModule, ActivityModule, StationDetailComponent],
  providers: [],
  exports: []
})
export class StationModule {}
