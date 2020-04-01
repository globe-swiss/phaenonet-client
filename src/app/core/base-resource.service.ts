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

  /**
   * Upserts the given object t stripping it of created and modified dates as they will be set by cloud functions.
   *
   * @param t the object to be created or updated
   * @param id the id of the object
   */
  upsert(t: T, id: string): Observable<T> {
    const { created, modified, ...withoutDates } = t as any;
    return from(
      this.afs
        .collection<T>(this.collectionName)
        .doc<T>(id)
        .set(withoutDates, { merge: true })
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