import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, identity, Observable, of } from 'rxjs';
import { first, mergeMap, tap } from 'rxjs/operators';
import { IdLike } from '../masterdata/masterdata-like';
import { AlertService } from '../messaging/alert.service';
import { FirestoreDebugService } from '../shared/firestore-debug.service';
import { BaseService } from './base.service';
import { ResourceService } from './resource.service';

export abstract class BaseResourceService<T> extends BaseService implements ResourceService<T> {
  constructor(
    protected alertService: AlertService,
    protected afs: AngularFirestore,
    protected collectionName: string,
    protected fds: FirestoreDebugService
  ) {
    super(alertService);
  }

  list(): Observable<T[]> {
    return this.afs
      .collection<T>(this.collectionName)
      .valueChanges({ idField: 'id' })
      .pipe(tap(x => this.fds.addRead(`${this.collectionName} (list)`, x.length)));
  }

  /**
   * Upserts the given object t stripping it of created and modified dates as they will be set by cloud functions.
   *
   * @param t the object to be created or updated
   * @param id the id of the object
   */
  upsert(t: T, id: string): Observable<T> {
    const { created, modified, ...withoutDates } = t as any;
    delete withoutDates.id;
    this.fds.addWrite(`${this.collectionName} (upsert)`);
    return from(
      this.afs
        .collection<T>(this.collectionName)
        .doc<T>(id)
        .set(withoutDates, { merge: true })
        .then(() => this.get(id).pipe(first()))
    ).pipe(mergeMap(identity));
  }

  get(id: string): Observable<T> {
    if (id == null) {
      console.error(`Fixme: get document with null value on ${this.collectionName}`);
      return of(null);
    }
    return this.afs
      .collection<T>(this.collectionName)
      .doc<T>(id)
      .valueChanges()
      .pipe(tap(() => this.fds.addRead(`${this.collectionName} (base-resource.get)`)));
  }

  getWithId(id: string): Observable<T & IdLike> {
    return this.afs
      .collection<T & IdLike>(this.collectionName)
      .doc<T & IdLike>(id)
      .valueChanges({ idField: 'id' })
      .pipe(tap(() => this.fds.addRead(`${this.collectionName} (base-resource.getWithId)`)));
  }

  /**
   * Deletes an document from this collection.
   * @param id the id of the document to be deleted
   */
  delete(id: string): Promise<void> {
    return this.afs.collection<T>(this.collectionName).doc<T>(id).delete();
  }
}
