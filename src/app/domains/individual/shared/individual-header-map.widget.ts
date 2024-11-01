import { AsyncPipe, NgIf } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MasterdataService } from '@masterdata/masterdata.service';
import { Individual } from '@shared/models/individual.model';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, first, map, mergeAll } from 'rxjs/operators';
import { GeoposService } from './geopos.service';
import { IndividualService } from './individual.service';

@Component({
  selector: 'app-individual-header-map',
  templateUrl: './individual-header-map.component.html',
  styleUrls: ['./individual-header-map.component.scss'],
  standalone: true,
  imports: [GoogleMap, MapMarker, NgIf, MatFabButton, MatIcon, AsyncPipe]
})
export class IndividualHeaderMapComponent implements OnInit {
  @Input() individual$: ReplaySubject<Individual>;
  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef;

  geopos$: Observable<google.maps.LatLngLiteral>;

  @Input() mode: 'edit' | 'detail';
  edit: boolean;

  zoom: number;

  options: google.maps.MapOptions;
  markerOptions$: Observable<google.maps.MarkerOptions>;

  center$: Observable<google.maps.LatLngLiteral>;

  imageUrl$: Observable<string>;

  displayLocateMe: boolean;

  constructor(
    private geoposService: GeoposService,
    private individualService: IndividualService,
    private masterdataService: MasterdataService
  ) {}

  ngOnInit(): void {
    this.edit = this.mode === 'edit';

    const config = {
      displayLocateMe: this.edit ? true : false,
      zoom: this.edit ? 9 : 13,
      mapTypeId: this.edit ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.TERRAIN,
      draggable: this.edit ? true : false,
      markerDraggable: this.edit ? true : false
    };

    const editIcon = { url: '/assets/img/map_pins/map_pin_generic.png', scaledSize: new google.maps.Size(55, 60) };

    this.displayLocateMe = config.displayLocateMe;
    this.zoom = config.zoom;
    this.options = {
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      minZoom: 8,
      mapTypeId: config.mapTypeId,
      draggable: config.draggable
    };

    this.markerOptions$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(
        i =>
          ({
            draggable: config.markerDraggable,
            icon: this.edit ? editIcon : this.masterdataService.individualToIcon(i)
          }) as google.maps.MarkerOptions
      )
    );

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

    this.center$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => i.geopos)
    );

    const detailGeopos$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => i.geopos)
    );
    this.geopos$ = this.edit ? this.geoposService.geopos$ : detailGeopos$;
    this.imageUrl$ = this.individual$.pipe(
      filter(individual => individual !== undefined),
      map(individual => this.individualService.getImageUrl(individual, true)),
      mergeAll()
    );
  }

  updateGeopos(event: google.maps.MapMouseEvent): void {
    if (this.edit) {
      this.geoposService.update(event.latLng);
    }
  }

  locateMe(): void {
    if (this.edit) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          this.geoposService.update(
            new google.maps.LatLng({ lat: position.coords.latitude, lng: position.coords.longitude })
          );
        });
      }
    }
  }
}
