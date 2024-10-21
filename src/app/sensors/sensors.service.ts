import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { FirestoreDebugService } from '../shared/firestore-debug.service';
import { DailySensorData, SensorDataInternal, Sensors } from './sensors';

@Injectable()
export class SensorsService extends BaseResourceService<Sensors> {
  constructor(
    alertService: AlertService,
    protected afs: Firestore,
    protected fds: FirestoreDebugService
  ) {
    super(alertService, afs, 'sensors', fds);
  }

  getSensorData(individual_id: string): Observable<DailySensorData[]> {
    return this.get(individual_id).pipe(
      tap(() => this.fds.addRead(`${this.collectionName} (getSensorData)`, 1)),
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
