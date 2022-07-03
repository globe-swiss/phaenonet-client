import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  CollectionReference,
  DocumentChangeAction,
  DocumentData
} from '@angular/fire/compat/firestore';
import { Timestamp } from '@firebase/firestore';
import * as Sentry from '@sentry/angular';
import { compress, decompress } from 'lz-string';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Individual } from '../individual/individual';
import { IdLike } from '../masterdata/masterdata-like';
import { FirestoreDebugService } from '../shared/firestore-debug.service';
@Injectable()
export class MapCacheService {
  private readonly CACHE_VERSION = 1;
  private readonly CACHE_VERSION_KEY = 'mapCacheVersion';
  private readonly CACHE_PREFIX = 'mapdata';
  private cachedData$: BehaviorSubject<(Individual & IdLike)[]> = new BehaviorSubject(new Array<Individual & IdLike>());
  private cache_subscription: Subscription = new Subscription();

  constructor(protected afs: AngularFirestore, protected fds: FirestoreDebugService) {
    this.checkVersion();
  }

  getIndividuals(year: number): Observable<(Individual & IdLike)[]> {
    this.cache_subscription.unsubscribe();
    // ignore if year is not set
    if (year > 0) {
      const cacheTs = this.loadCache(year);
      console.log(`loaded map cache for ${year}, ${this.cachedData$.value.length} individuals`);
      this.cache_subscription = this.setupDocumentListener(year, cacheTs).subscribe();
    }
    return this.cachedData$;
  }

  /**
   * Load map data from local cache.
   * @param year the year
   * @returns last modified timestamp, null if cache is empty
   */
  private loadCache(year: number): number | null {
    try {
      const localData = localStorage.getItem(`${this.CACHE_PREFIX}_${year}`);
      // do not process and push data if local storage was empty
      if (localData) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const [cacheTs, localIndividuals] = JSON.parse(decompress(localData) as string) as [
          number,
          (Individual & IdLike)[]
        ];
        // restore timestamp objects
        localIndividuals.map(x => {
          ['created', 'modified', 'last_observation_date'].forEach(field => {
            if (x[field]) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              x[field] = new Timestamp(x[field].seconds, x[field].nanosecods);
            }
          });
        });
        this.cachedData$ = new BehaviorSubject(localIndividuals);
        return cacheTs;
      } else {
        this.cachedData$ = new BehaviorSubject(new Array<Individual & IdLike>());
        return null;
      }
    } catch (error) {
      console.log(error);
      if (environment.sentryEnabled) {
        Sentry.captureException(error);
      }

      this.removeCache(year);
      this.cachedData$ = new BehaviorSubject(new Array<Individual & IdLike>());
      return null;
    }
  }

  private updateCache(year: number, lastModified: number, individuals: (Individual & IdLike)[]): void {
    this.cachedData$.next(individuals);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    localStorage.setItem(`${this.CACHE_PREFIX}_${year}`, compress(JSON.stringify([lastModified, individuals])));
  }

  private removeCache(year: number) {
    localStorage.removeItem(`${this.CACHE_PREFIX}_${year}`);
  }

  /**
   * Listen to individual document changes starting from a given timestamp.
   * @param year the year
   * @param cacheTs the timestamp from when to start listening, null if initial
   * @returns Observable with document changes
   */
  private setupDocumentListener(year: number, cacheTs: number): Observable<DocumentChangeAction<Individual>[]> {
    return this.afs
      .collection<Individual>('individuals', ref => this.getIndividualQuery(year, cacheTs, ref))
      .stateChanges()
      .pipe(
        tap(actions => this.processActions(year, actions)),
        tap(x => this.fds.addRead(`individuals (mapCache)`, x.length))
      );
  }

  private getIndividualQuery(
    year: number,
    cacheTs: number,
    individual_collection_ref: CollectionReference<DocumentData>
  ) {
    let query = individual_collection_ref.where('year', '==', year);
    // if chache is initialized load all (include individuals without modified field)
    if (cacheTs) {
      console.log(
        `listen to changes from changes from ${Timestamp.fromMillis(cacheTs).toDate().toUTCString()} for ${year}`
      );
      query = query.where('modified', '>', Timestamp.fromMillis(cacheTs + 0.01));
    }
    return query;
  }

  private processActions(year: number, actions: DocumentChangeAction<Individual>[]): void {
    // do not process empty action arrays
    if (actions.length > 0) {
      let cachedData = this.cachedData$.value;
      let lastModified = Number.NEGATIVE_INFINITY;
      actions.forEach(action => {
        // remove old record from cache
        cachedData = cachedData.filter(x => x.id != action.payload.doc.id);
        const individual = action.payload.doc.data();
        // only add individuals that have observations (map requirement)
        if (action.type != 'removed' && individual.last_observation_date) {
          cachedData.push({ id: action.payload.doc.id, ...individual });
        }
        if (individual.modified) {
          lastModified = Math.max(lastModified, individual.modified.toMillis());
        }
      });
      this.updateCache(year, lastModified, cachedData);
    }
  }

  private checkVersion(): void {
    const current_version = localStorage.getItem(this.CACHE_VERSION_KEY);
    if (current_version && current_version != String(this.CACHE_VERSION)) {
      console.log('Cache version changed -> clear localstorage');
      localStorage.clear();
    }
    localStorage.setItem(this.CACHE_VERSION_KEY, String(this.CACHE_VERSION));
  }
}
