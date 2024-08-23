import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { IndividualModule } from '../individual/individual.module';

import { MapOverviewComponent } from './map-overview.component';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';

@NgModule({
  imports: [MapRoutingModule, GoogleMapsModule, IndividualModule, MapComponent, MapOverviewComponent],
  exports: []
})
export class MapModule {}
