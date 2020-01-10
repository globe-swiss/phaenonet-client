import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { MapOverviewComponent } from './map-overview.component';

import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  imports: [SharedModule, MapRoutingModule, GoogleMapsModule],
  declarations: [MapComponent, MapOverviewComponent],
  providers: [],
  exports: []
})
export class MapModule {}
