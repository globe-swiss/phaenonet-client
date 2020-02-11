import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { MapOverviewComponent } from './map-overview.component';

import { GoogleMapsModule } from '@angular/google-maps';
import { IndividualModule } from '../individual/individual.module';

@NgModule({
  imports: [SharedModule, MapRoutingModule, GoogleMapsModule, IndividualModule],
  declarations: [MapComponent, MapOverviewComponent],
  providers: [],
  exports: []
})
export class MapModule {}
