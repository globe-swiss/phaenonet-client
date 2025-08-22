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
    protected afs: Firestore,
    protected collectionName: string,
    protected fds: FirestoreDebugService
  ) {
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
      tap(x => this.fds.addRead(`${this.collectionName} (${this.constructor.name}.list)`, x.length))
    );
  }

  /**
   * Queries the resource collection (adding id field)
   * @param queryConstraints
   * @returns
   */
  protected queryCollection(...queryConstraints: QueryConstraint[]): Observable<(T & IdLike)[]> {
    return collectionData(query(this.collectionRef, ...queryConstraints), { idField: 'id' }).pipe(
      tap(x => this.fds.addRead(`${this.collectionName} (${this.constructor.name}.queryCollection)`, x.length))
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

    this.fds.addWrite(`${this.collectionName} (${this.constructor.name}.upsert)`);

    const docPromise = setDoc(this.getDocRef(uid), withoutDates, { merge: true }).then(() =>
      this.get(uid).pipe(first())
    );
    return from(docPromise).pipe(mergeMap(identity));
  }

  /**
   * Gets a document from this collection.
   * Note: By default, if the document is not found, no document is returned.
   * @param id the id of the document to be retrieved
   * @param returnUndefined if true, returns undefined if the document is not found, otherwise no document is returned
   * @returns an observable of the document
   */
  get(id: string, returnUndefined = false): Observable<T> {
    return docData<T>(this.getDocRef(String(id))).pipe(
      tap(data => {
        if (!data && !returnUndefined) {
          console.warn(
            `Document with ID ${id} not found in collection ${this.collectionName} (${this.constructor.name}.get)`
          );
        }
        this.fds.addRead(`${this.collectionName} (${this.constructor.name}.get)`);
      }),
      filter(data => !!data || returnUndefined) // Skip undefined/null values
    );
  }

  /**
   * Gets a document from this collection and includes its docuement id in the 'id' field.
   * Note: By default, if the document is not found, no document is returned.
   * @param id the id of the document to be retrieved
   * @param returnUndefined if true, returns undefined if the document is not found, otherwise no document is returned
   * @returns an observable of the document
   */
  getWithId(id: string, returnUndefined = false): Observable<T & IdLike> {
    return docData<T & IdLike>(this.getDocRef(String(id)), { idField: 'id' }).pipe(
      tap(data => {
        if (!data && !returnUndefined) {
          console.warn(
            `Document with ID ${id} not found in collection ${this.collectionName} (${this.constructor.name}.getWithId)`
          );
        }
        this.fds.addRead(`${this.collectionName} (${this.constructor.name}.getWithId)`);
      }),
      filter(data => !!data || returnUndefined) // Skip undefined/null values
    );
  }

  /**
   * Deletes an document from this collection.
   * @param id the id of the document to be deleted
   */
  delete(id: string): Promise<void> {
    this.fds.addWrite(`${this.collectionName} (${this.constructor.name}.delete)`);
    return deleteDoc(this.getDocRef(id));
  }
}
