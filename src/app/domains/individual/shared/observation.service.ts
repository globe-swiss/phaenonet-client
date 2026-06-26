import { Injectable } from '@angular/core';
import { Timestamp, limit, where } from '@angular/fire/firestore';
import { BaseResourceService } from '@core/services/base-resource.service';
import { Observation } from '@shared/models/observation.model';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ObservationService extends BaseResourceService<Observation> {
  constructor() {
    super('observations');
  }

  listByIndividual(individualId: string): Observable<Observation[]> {
    return this.queryCollection(where('individual_id', '==', individualId)).pipe(
      tap(x => this.fds.addRead(`${this.collectionName} (${this.constructor.name}.listByIndividual)`, x.length)),
      map(obs =>
        obs.map(o => {
          o.date = o.date ? (o.date as unknown as Timestamp).toDate() : o.date;
          o.created = o.created ? (o.created as unknown as Timestamp).toDate() : o.created;
          o.modified = o.modified ? (o.modified as unknown as Timestamp).toDate() : o.modified;

          return o;
        })
      )
    );
  }

  hasObservations(individualId: string): Observable<boolean> {
    return this.queryCollection(where('individual_id', '==', individualId), limit(1)).pipe(
      tap(x => this.fds.addRead(`${this.collectionName} (${this.constructor.name}.hasObservations)`, x.length)),
      map(observations => {
        return observations.length > 0;
      })
    );
  }
}
