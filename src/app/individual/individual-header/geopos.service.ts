import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class GeoposService {
  private geopos: BehaviorSubject<google.maps.LatLngLiteral> = new BehaviorSubject({ lat: 47.164364, lng: 8.518581 });
  private altitude: BehaviorSubject<number> = new BehaviorSubject(0);
  geopos$ = this.geopos.asObservable();
  altitude$ = this.altitude.asObservable();

  elevator = new google.maps.ElevationService();

  constructor() {
    this.updateAltitude();
  }

  update(latLng: google.maps.LatLng): void {
    this.geopos.next(latLng.toJSON());
    this.updateAltitude();
  }

  private updateAltitude(): void {
    this.elevator
      .getElevationForLocations({ locations: [this.geopos.value] })
      .then(({ results }) => {
        if (results[0]) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          this.altitude.next(Math.round(results[0].elevation));
        } else {
          console.error(`Elevation service no results found for: ${JSON.stringify(this.geopos.value)}`);
        }
      })
      .catch(e => console.error(e));
  }

  getAltitude(): number {
    return this.altitude.value;
  }

  getGeoPos(): google.maps.LatLngLiteral {
    return this.geopos.value;
  }
}
