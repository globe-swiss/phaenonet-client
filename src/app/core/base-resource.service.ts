import {
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  docData,
  DocumentData,
  DocumentReference,
  Firestore,
  FirestoreDataConverter,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
  setDoc
} from '@angular/fire/firestore';
import { from, identity, Observable, of } from 'rxjs';
import { first, mergeMap, tap } from 'rxjs/operators';
import { IdLike } from '../masterdata/masterdata-like';
import { AlertService } from '../messaging/alert.service';
import { FirestoreDebugService } from '../shared/firestore-debug.service';
import { BaseService } from './base.service';
import { ResourceService } from './resource.service';

export abstract class BaseResourceService<T> extends BaseService implements ResourceService<T> {
  protected converter: FirestoreDataConverter<T & IdLike> = {
    toFirestore: (data: T & IdLike): DocumentData => {
      return { ...data };
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot): T & IdLike => {
      const data = snapshot.data() as T;
      return {
        ...data,
        id: snapshot.id
      };
    }
  };

  protected collectionRef: CollectionReference<T & IdLike, DocumentData>;

  constructor(
    protected alertService: AlertService,
    protected afs: Firestore,
    protected collectionName: string,
    protected fds: FirestoreDebugService
  ) {
    super(alertService);
    this.collectionRef = collection(this.afs, this.collectionName).withConverter(this.converter);
  }

  protected getDocRef(id: string): DocumentReference<T & IdLike, DocumentData> {
    return doc(this.afs, this.collectionName, id).withConverter(this.converter);
  }

  protected createId() {
    return doc(collection(this.afs, '_')).id;
  }

  list(): Observable<(T & IdLike)[]> {
    return collectionData<T & IdLike>(this.collectionRef, { idField: 'id' }).pipe(
      tap(x => this.fds.addRead(`${this.collectionName} (list)`, x.length))
    );
  }

  /**
   * Queries the resource collection (adding id field)
   * @param queryConstraints
   * @returns
   */
  protected queryCollection(...queryConstraints: QueryConstraint[]) {
    return collectionData(query(this.collectionRef, ...queryConstraints), { idField: 'id' }).pipe(
      tap(() => this.fds.addRead(`${this.collectionName} (base-resource.queryCollection)`))
    );
  }

  /**
   * Upserts the given object t stripping it of created and modified dates as they will be set by cloud functions.
   *
   * @param t the object to be created or updated
   * @param id the id of the object
   */
  upsert(t: Partial<T>, uid: string): Observable<T> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const { id, created, modified, ...withoutDates }: any = t;

    this.fds.addWrite(`${this.collectionName} (upsert)`);

    const docPromise = setDoc(this.getDocRef(uid), withoutDates, { merge: true }).then(() =>
      this.get(uid).pipe(first())
    );
    return from(docPromise).pipe(mergeMap(identity));
  }

  get(id: string): Observable<T> {
    if (id == null) {
      console.error(`get document with null value on ${this.collectionName}`);
      return of(null);
    }

    return docData<T>(this.getDocRef(id)).pipe(
      tap(() => this.fds.addRead(`${this.collectionName} (base-resource.get)`))
    );
  }

  getWithId(id: string): Observable<T & IdLike> {
    if (id == null) {
      console.error(`get document with id with null value on ${this.collectionName}`);
      return of(null);
    }

    return docData<T & IdLike>(this.getDocRef(id), { idField: 'id' }).pipe(
      tap(() => this.fds.addRead(`${this.collectionName} (base-resource.getWithId)`))
    );
  }

  /**
   * Deletes an document from this collection.
   * @param id the id of the document to be deleted
   */
  delete(id: string): Promise<void> {
    return deleteDoc(this.getDocRef(id));
  }
}
