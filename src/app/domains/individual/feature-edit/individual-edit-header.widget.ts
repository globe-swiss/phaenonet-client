import { AsyncPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { basemaps, MapType } from '@shared/models/basemaps.model';
import { Individual } from '@shared/models/individual.model';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { GeoposService } from '../shared/geopos.service';

@Component({
  selector: 'app-individual-edit-header',
  templateUrl: './individual-edit-header.widget.html',
  styleUrls: ['./individual-edit-header.widget.scss'],
  imports: [GoogleMap, MapMarker, MatIcon, MatFabButton, AsyncPipe]
})
export class IndividualEditHeaderComponent implements OnInit {
  @Input() individual$: ReplaySubject<Individual>;

  geopos$: Observable<google.maps.LatLngLiteral>;

  zoom: number;
  mapOptions: google.maps.MapOptions;
  markerOptions: google.maps.MarkerOptions;

  constructor(private geoposService: GeoposService) {}

  ngOnInit(): void {
    this.mapOptions = {
      mapTypeId: basemaps[MapType.HYBRID].mapTypeID,
      styles: basemaps[MapType.HYBRID].styles,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      rotateControl: false,
      minZoom: 8,
      zoom: 9,
      tilt: 0,
      draggable: true
    };
    this.markerOptions = {
      draggable: true,
      icon: { url: '/assets/img/map_pins/map_pin_generic.png', scaledSize: new google.maps.Size(55, 60) }
    };

    this.individual$
      .pipe(
        first(),
        filter(individual => individual !== undefined)
      )
      .subscribe(i => {
        if (i.geopos) {
          this.geoposService.update(new google.maps.LatLng(i.geopos));
        }
      });

    this.geopos$ = this.geoposService.geopos$;
  }

  updateGeopos(event: google.maps.MapMouseEvent): void {
    this.geoposService.update(event.latLng);
  }

  locateMe(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.geoposService.update(
          new google.maps.LatLng({ lat: position.coords.latitude, lng: position.coords.longitude })
        );
      });
    }
  }
}
