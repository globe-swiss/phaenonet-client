import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class GeoposService {
  readonly initialGeopos: google.maps.LatLngLiteral = { lat: 46.818188, lng: 8.227512 };
  private center: BehaviorSubject<google.maps.LatLngLiteral> = new BehaviorSubject(this.initialGeopos);
  private geopos: BehaviorSubject<google.maps.LatLngLiteral> = new BehaviorSubject(this.initialGeopos);
  private altitude: BehaviorSubject<number> = new BehaviorSubject(0);
  center$ = this.center.asObservable();
  geopos$ = this.geopos.asObservable();
  altitude$ = this.altitude.asObservable();

  elevator = new google.maps.ElevationService();

  constructor() {}

  init() {
    this.update(new google.maps.LatLng(this.initialGeopos));
  }

  update(latLng: google.maps.LatLng) {
    this.geopos.next(latLng.toJSON());
    this.center.next(latLng.toJSON());
    this.updateAltitude(latLng);
  }

  private updateAltitude(latLng: google.maps.LatLng) {
    this.elevator.getElevationForLocations({ locations: [latLng] }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.altitude.next(Math.round(results[0].elevation));
        }
      }
    });
  }

  getAltitude() {
    return this.altitude.value;
  }

  getGeoPos() {
    return this.geopos.value;
  }
}
