import { Component, OnInit, ViewChild } from '@angular/core';
import { NavService } from '../core/nav/nav.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IndividualModule } from '../individual/individual.module';
import { IndividualService } from '../individual/individual.service';
import { Individual } from '../individual/individual';
import { MapMarker, MapInfoWindow } from '@angular/google-maps';

@Component({
  templateUrl: './map-overview.component.html',
  styleUrls: ['./map-overview.component.scss']
})
export class MapOverviewComponent implements OnInit {
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

  center = { lat: 46.818188, lng: 8.227512 };
  zoom = 9;
  options = { mapTypeId: google.maps.MapTypeId.SATELLITE };
  markerOptions = { draggable: false };
  individuals: Observable<Individual[]>;
  positions: Observable<google.maps.LatLngLiteral[]>;

  constructor(private navService: NavService, private individualService: IndividualService) {}

  ngOnInit() {
    this.navService.setLocation('Karte');
    this.individuals = this.individualService.getIndividuals();

    this.positions = this.individuals.pipe(
      map(individuals => {
        return individuals.map(individual => {
          const [lat, lng] = individual.geopos.split(',').map(s => +s);
          return {
            lat: lat,
            lng: lng
          } as google.maps.LatLngLiteral;
        });
      })
    );
  }

  openInfoWindow(marker: MapMarker, pos: google.maps.LatLngLiteral) {
    this.infoWindow.open(marker);
  }
}
