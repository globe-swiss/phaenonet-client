import { AngularFirestore } from '@angular/fire/firestore';
import { from, identity, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AlertService } from '../messaging/alert.service';
import { BaseService } from './base.service';
import { ResourceService } from './resource.service';

export abstract class BaseResourceService<T> extends BaseService implements ResourceService<T> {
  constructor(protected alertService: AlertService, protected afs: AngularFirestore, protected collectionName: string) {
    super(alertService);
  }

  list(): Observable<T[]> {
    return this.afs.collection<T>(this.collectionName).valueChanges({ idField: 'id' });
  }

  upsert(t: T, id: string): Observable<T> {
    return from(
      this.afs
        .collection<T>(this.collectionName)
        .doc<T>(id)
        .set(t, { merge: true })
        .then(_ => this.get(id))
    ).pipe(mergeMap(identity));
  }

  get(id: string): Observable<T> {
    return this.afs
      .collection<T>(this.collectionName)
      .doc<T>(id)
      .valueChanges();
  }
}
