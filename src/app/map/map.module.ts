import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { IndividualModule } from '../individual/individual.module';
import { SharedModule } from '../shared/shared.module';
import { MapOverviewComponent } from './map-overview.component';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';

@NgModule({
  imports: [SharedModule, MapRoutingModule, GoogleMapsModule, IndividualModule],
  declarations: [MapComponent, MapOverviewComponent],
  providers: [],
  exports: []
})
export class MapModule {}
