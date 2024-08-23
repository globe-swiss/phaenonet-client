import { NgModule } from '@angular/core';

import { IndividualModule } from '../individual/individual.module';

import { StationDetailComponent } from './station-detail.component';
import { StationRoutingModule } from './station-routing.module';

@NgModule({
  imports: [StationRoutingModule, IndividualModule, StationDetailComponent],
  exports: []
})
export class StationModule {}
