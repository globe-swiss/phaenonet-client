import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { DailySensorData, SensorDataInternal, Sensors } from '@shared/models/sensors';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SensorsService extends BaseResourceService<Sensors> {
  constructor(
    protected afs: Firestore,
    protected fds: FirestoreDebugService
  ) {
    super(afs, 'sensors', fds);
  }

  getSensorData(individual_id: string): Observable<DailySensorData[]> {
    return this.get(individual_id).pipe(
      tap(() => this.fds.addRead(`${this.collectionName} (${this.constructor.name}.getSensorData)`)),
      filter(sensors => sensors !== undefined),
      map(sensors => {
        const data = sensors.data;
        const keys = Object.keys(data);

        const v = keys.sort().map(key => ({ day: key, ...data[key] }));
        return v.map(this.#toDailySensorData);
      })
    );
  }

  #toDailySensorData = (sensors: SensorDataInternal & { day: string }) => {
    const s: DailySensorData = {
      airHumidity: sensors.ahs / sensors.n,
      airTemperature: sensors.ats / sensors.n,
      soilHumidity: sensors.shs / sensors.n,
      soilTemperature: sensors.sts / sensors.n,
      day: new Date(sensors.day)
    };
    return s;
  };
}
