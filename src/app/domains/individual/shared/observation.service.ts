import { Injectable } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { Observation } from '@shared/models/observation.model';
import { AlertService } from '@shared/services/alert.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ObservationService extends BaseResourceService<Observation> {
  constructor(
    alertService: AlertService,
    protected afs: Firestore,
    protected fds: FirestoreDebugService
  ) {
    super(alertService, afs, 'observations', fds);
  }

  listByIndividual(individualId: string): Observable<Observation[]> {
    return this.queryCollection(where('individual_id', '==', individualId)).pipe(
      tap(x => this.fds.addRead(`${this.collectionName} (listByIndividual)`, x.length)),
      map(obs =>
        obs.map(o => {
          o.date = o.date ? (o.date as any).toDate() : o.date;
          o.created = o.created ? (o.created as any).toDate() : o.created;
          o.modified = o.modified ? (o.modified as any).toDate() : o.modified;

          return o;
        })
      )
    );
  }
}
