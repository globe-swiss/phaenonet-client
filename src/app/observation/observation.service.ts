import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { Observation } from './observation';

@Injectable()
export class ObservationService extends BaseResourceService<Observation> {
  constructor(alertService: AlertService, protected afs: AngularFirestore) {
    super(alertService, afs, 'observations');
  }

  listByIndividual(individualId: string): Observable<Observation[]> {
    return this.afs
      .collection<Observation>(this.collectionName, ref => ref.where('individual_id', '==', individualId))
      .valueChanges({ idField: 'id' })
      .pipe(
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
