import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, first, map, mergeAll, tap } from 'rxjs/operators';

import { Individual } from '../../individual';
import { IndividualService } from '../../individual.service';
import { GeoposService } from './geopos.service';

@Component({
  selector: 'app-individual-edit-header',
  templateUrl: './individual-edit-header.component.html',
  styleUrls: ['./individual-edit-header.component.scss']
})
export class EditHeaderComponent implements OnInit {
  @Input() individual$: ReplaySubject<Individual>;

  geopos$: Observable<google.maps.LatLngLiteral>;
  zoom = 9;
  options: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.HYBRID,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    minZoom: 8
  };
  markerOptions: google.maps.MarkerOptions = {
    draggable: true,
    icon: { url: '/assets/img/map_pins/map_pin_generic.png', scaledSize: new google.maps.Size(55, 60) }
  };

  imageUrl$: Observable<string>;

  constructor(
    private geoposService: GeoposService,
    private individualService: IndividualService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit() {
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
    this.geopos$ = this.geoposService.geopos$;
    this.imageUrl$ = this.individual$.pipe(
      filter(individual => individual !== undefined),
      map(individual => this.individualService.getImageUrl(individual, true)),
      mergeAll()
    );
  }

  updateGeopos(event: google.maps.MouseEvent): void {
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
    this.analytics.logEvent('individual.locate-me');
  }
}
