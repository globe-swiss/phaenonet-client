import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class GeoposService {
  readonly initialGeopos: google.maps.LatLngLiteral = { lat: 46.818188, lng: 8.227512 };
  center: BehaviorSubject<google.maps.LatLngLiteral> = new BehaviorSubject(this.initialGeopos);
  geopos: BehaviorSubject<google.maps.LatLngLiteral> = new BehaviorSubject(this.initialGeopos);
  altitude: BehaviorSubject<number> = new BehaviorSubject(0);

  elevator = new google.maps.ElevationService();

  constructor() {}

  public update(latLng: google.maps.LatLng) {
    this.geopos.next(latLng.toJSON());
    this.center.next(latLng.toJSON());
    this.updateAltitude(latLng);
  }

  private updateAltitude(latLng: google.maps.LatLng) {
    this.elevator.getElevationForLocations({ locations: [latLng] }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.altitude.next(results[0].elevation);
        }
      }
    });
  }
}
