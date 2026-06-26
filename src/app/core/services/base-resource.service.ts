import { inject } from '@angular/core';
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
import { IdLike } from '@core/core.model';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { from, identity, Observable } from 'rxjs';
import { filter, first, mergeMap, tap } from 'rxjs/operators';

export abstract class BaseResourceService<T> {
  private afs = inject(Firestore);
  protected fds = inject(FirestoreDebugService);

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

  constructor(protected collectionName: string) {
    this.collectionRef = collection(this.afs, this.collectionName).withConverter(this.converter);
  }

  protected getDocRef(id: string): DocumentReference<T & IdLike, DocumentData> {
    return doc(this.afs, this.collectionName, id).withConverter(this.converter);
  }

  protected createId() {
    return doc(collection(this.afs, '_')).id;
  }

  /**
   * Records a read access in the FirestoreDebugService for an operation that does not
   * go through one of the base methods below.
   * @param caller label identifying the operation (e.g. the method name)
   * @param amt the number of documents read
   */
  protected trackRead(caller: string, amt = 1): void {
    this.fds.addRead(`${this.collectionName} (${caller})`, amt);
  }

  /**
   * Records a write access in the FirestoreDebugService for an operation that does not
   * go through one of the base methods below.
   * @param caller label identifying the operation (e.g. the method name)
   * @param amt the number of documents written
   */
  protected trackWrite(caller: string, amt = 1): void {
    this.fds.addWrite(`${this.collectionName} (${caller})`, amt);
  }

  /**
   * Lists the resource collection (adding id field)
   * @param caller label identifying the calling operation (e.g. the method name)
   */
  list(caller: string): Observable<(T & IdLike)[]> {
    return collectionData<T & IdLike>(this.collectionRef, { idField: 'id' }).pipe(
      tap(x => this.trackRead(caller, x.length))
    );
  }

  /**
   * Queries the resource collection (adding id field)
   * @param caller label identifying the calling operation (e.g. the method name)
   * @param queryConstraints
   * @returns
   */
  protected queryCollection(caller: string, ...queryConstraints: QueryConstraint[]): Observable<(T & IdLike)[]> {
    return collectionData(query(this.collectionRef, ...queryConstraints), { idField: 'id' }).pipe(
      tap(x => this.trackRead(caller, x.length))
    );
  }

  /**
   * Upserts the given object t stripping it of created and modified dates as they will be set by cloud functions.
   *
   * @param caller label identifying the calling operation (e.g. the method name)
   * @param t the object to be created or updated
   * @param uid the id of the object
   */
  upsert(caller: string, t: Partial<T>, uid: string): Observable<T> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const { id, created, modified, ...withoutDates }: any = t;

    this.trackWrite(caller);

    const docPromise = setDoc(this.getDocRef(uid), withoutDates, { merge: true }).then(() =>
      this.get(caller, uid).pipe(first())
    );
    return from(docPromise).pipe(mergeMap(identity));
  }

  /**
   * Gets a document from this collection.
   * Note: By default, if the document is not found, no document is returned.
   * @param caller label identifying the calling operation (e.g. the method name)
   * @param id the id of the document to be retrieved
   * @param returnUndefined if true, returns undefined if the document is not found, otherwise no document is returned
   * @returns an observable of the document
   */
  get(caller: string, id: string, returnUndefined = false): Observable<T> {
    return docData<T>(this.getDocRef(String(id))).pipe(
      tap(data => {
        if (!data && !returnUndefined) {
          console.warn(`Document with ID ${id} not found in collection ${this.collectionName} (${caller})`);
        }
        this.trackRead(caller);
      }),
      filter(data => !!data || returnUndefined) // Skip undefined/null values
    );
  }

  /**
   * Gets a document from this collection and includes its docuement id in the 'id' field.
   * Note: By default, if the document is not found, no document is returned.
   * @param caller label identifying the calling operation (e.g. the method name)
   * @param id the id of the document to be retrieved
   * @param returnUndefined if true, returns undefined if the document is not found, otherwise no document is returned
   * @returns an observable of the document
   */
  getWithId(caller: string, id: string, returnUndefined = false): Observable<T & IdLike> {
    return docData<T & IdLike>(this.getDocRef(String(id)), { idField: 'id' }).pipe(
      tap(data => {
        if (!data && !returnUndefined) {
          console.warn(`Document with ID ${id} not found in collection ${this.collectionName} (${caller})`);
        }
        this.trackRead(caller);
      }),
      filter(data => !!data || returnUndefined) // Skip undefined/null values
    );
  }

  /**
   * Deletes an document from this collection.
   * @param caller label identifying the calling operation (e.g. the method name)
   * @param id the id of the document to be deleted
   */
  delete(caller: string, id: string): Promise<void> {
    this.trackWrite(caller);
    return deleteDoc(this.getDocRef(id));
  }
}
