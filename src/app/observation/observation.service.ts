import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { Observation } from './observation';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
            o.date = (o.date as any).toDate();
            return o;
          })
        )
      );
  }
}
