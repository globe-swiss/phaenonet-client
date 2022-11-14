import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { FirestoreDebugService } from '../shared/firestore-debug.service';
import { DailySensorData, Sensors } from './sensors';

@Injectable()
export class SensorsService extends BaseResourceService<Sensors> {
  constructor(alertService: AlertService, protected afs: AngularFirestore, protected fds: FirestoreDebugService) {
    super(alertService, afs, 'sensors', fds);
  }

  getSensorData(individual_id: string): Observable<DailySensorData[]> {
    return this.afs
      .collection<{ data: { [name: string]: Sensors }; year: number }>(this.collectionName)
      .doc(individual_id)
      .valueChanges()
      .pipe(
        map(sensors => {
          const data = sensors.data;
          const keys = Object.keys(data);

          const v = keys.sort().map(key => ({ day: key, ...data[key] }));
          return v.map(this.#toDailySensorData);
        })
      )
      .pipe(tap(x => this.fds.addRead(`${this.collectionName} (getSensorData)`, x.length)));
  }

  #toDailySensorData = (sensors: Sensors & { day: string }) => {
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
