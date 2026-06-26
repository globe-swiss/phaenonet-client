import { Injectable } from '@angular/core';
import { BaseResourceService } from '@core/services/base-resource.service';
import { DailySensorData, SensorDataInternal, Sensors } from '@shared/models/sensors';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SensorsService extends BaseResourceService<Sensors> {
  constructor() {
    super('sensors');
  }

  getSensorData(individual_id: string): Observable<DailySensorData[]> {
    return this.get('SensorsService.getSensorData', individual_id).pipe(
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
