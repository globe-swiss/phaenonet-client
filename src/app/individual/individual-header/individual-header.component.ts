import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { Observable, ReplaySubject, of } from 'rxjs';
import { filter, first, map, mergeAll } from 'rxjs/operators';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Individual } from '../individual';
import { IndividualService } from '../individual.service';
import { GeoposService } from './geopos.service';

@Component({
  selector: 'app-individual-header',
  templateUrl: './individual-header.component.html',
  styleUrls: ['./individual-header.component.scss']
})
export class IndividualHeaderComponent implements OnInit {
  @Input() individual$: ReplaySubject<Individual>;

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
    private masterdataService: MasterdataService,
    private analytics: AngularFireAnalytics
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
          } as google.maps.MarkerOptions)
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
        } else {
          this.geoposService.init();
        }
      });
    this.center$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => i.geopos)
    );

    const editGeopos$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => i.geopos)
    );
    this.geopos$ = this.edit ? editGeopos$ : this.geoposService.geopos$;
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
      void this.analytics.logEvent('individual.locate-me');
    }
  }
}
