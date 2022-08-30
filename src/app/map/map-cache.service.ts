import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  CollectionReference,
  DocumentChangeAction,
  DocumentData
} from '@angular/fire/compat/firestore';
import { Timestamp } from '@angular/fire/firestore';
import * as Sentry from '@sentry/angular';
import { compress, decompress } from 'lz-string';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Individual } from '../individual/individual';
import { IdLike } from '../masterdata/masterdata-like';
import { FirestoreDebugService } from '../shared/firestore-debug.service';
import { LocalService } from '../shared/local.service';

/**
 * Initially loads all changes for each selected year and
 * updates local cache. After initial loading
 * any changes to the collection will update the local cache.
 *
 * Offline deletes however will only update the cache while online.
 * As these deletes are very rare anyway the cache should be cleared
 * via `clearCache()` method if an individual was not found.
 */
@Injectable()
export class MapCacheService {
  private readonly CACHE_PREFIX = 'mapdata';
  private cachedData$: BehaviorSubject<(Individual & IdLike)[]> = new BehaviorSubject(new Array<Individual & IdLike>());
  private changeListenerSubscription: Subscription = new Subscription();

  constructor(
    protected afs: AngularFirestore,
    protected fds: FirestoreDebugService,
    private localService: LocalService
  ) {}

  getIndividuals(year?: number): Observable<(Individual & IdLike)[]> {
    // ignore if year is not set
    if (year > 0) {
      // read local cache and initialize observable
      const { cacheTs, cachedData } = this.loadCache(year);
      console.log(`loaded map cache for ${year}, ${cachedData.length} individuals`);

      this.changeListenerSubscription.unsubscribe();
      this.cachedData$.next(cachedData);
      // subscribe to changes starting with at the last modification in the local cache
      this.changeListenerSubscription = this.setupChangeListener(year, cacheTs).subscribe(x =>
        this.cachedData$.next(x)
      );
    }
    return this.cachedData$;
  }

  /**
   * Load map data from local cache into cachedData$.
   * @param year the year
   * @returns last modified timestamp, null if cache is empty
   */
  private loadCache(year: number): {
    cacheTs?: number;
    cachedData?: (Individual & IdLike)[];
  } {
    let cachedData = new Array<Individual & IdLike>();
    let cacheTs: number = null;
    try {
      const localData = this.localService.localStorageGet(`${this.CACHE_PREFIX}_${year}`);
      // do not process and push data if local storage was empty
      if (localData) {
        [cacheTs, cachedData] = this.parseCompressedCache(localData);
        // restore timestamp objects
        console.log(cachedData);
        cachedData = cachedData.map(individual => this.restoreIndividualTimestamps(individual));
      }
    } catch (error) {
      console.error(error);
      if (environment.sentryEnabled) {
        Sentry.captureException(error);
      }

      // clear cache on error and restart fresh
      this.removeLocalCache(year);
      cachedData = new Array<Individual & IdLike>();
      cacheTs = null;
    }
    return { cacheTs: cacheTs, cachedData: cachedData };
  }

  private restoreIndividualTimestamps<T extends Individual>(individual: T): T {
    ['created', 'modified', 'last_observation_date'].forEach(field => {
      if (individual[field]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        individual[field] = new Timestamp(individual[field].seconds, 0);
      }
    });
    return individual;
  }

  private parseCompressedCache(localData: string): [number, (Individual & IdLike)[]] {
    return JSON.parse(decompress(localData)) as [number, (Individual & IdLike)[]];
  }

  /**
   * Listen to individual document changes starting from a given timestamp and return the actions.
   * @param year the year
   * @param cacheTs the timestamp from when to start listening, null if initial
   * @returns Observable with document changes
   */
  private setupChangeListener(year: number, cacheTs: number): Observable<(Individual & IdLike)[]> {
    return this.afs
      .collection<Individual>('individuals', ref => this.constructChangeListenerQuery(year, cacheTs, ref))
      .stateChanges()
      .pipe(
        tap(x => this.fds.addRead(`individuals (mapCache)`, x.length)),
        filter(actions => actions.length > 0), // filter empty action arrays
        map(actions => this.processActions(actions)),
        tap(({ cacheTs, cachedData }) => this.updateLocalCache(year, cacheTs, cachedData)),
        map(({ cachedData }) => cachedData)
      );
  }

  private constructChangeListenerQuery(
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

  /**
   * Processes change action from Firestore and merges it with the current cached data.
   * @param actions array of actions from Firestore. MUST not be empty.
   * @returns complete updated set if cached individuals & timestamp if the last change in the data set
   */
  private processActions(actions: DocumentChangeAction<Individual>[]): {
    cacheTs: number;
    cachedData: (Individual & IdLike)[];
  } {
    // do not process empty action arrays
    if (actions.length > 0) {
      let cachedData = this.cachedData$.value;
      let cacheTs = Number.NEGATIVE_INFINITY;
      actions.forEach(action => {
        // remove old record from cache
        cachedData = cachedData.filter(x => x.id != action.payload.doc.id);
        const individual = action.payload.doc.data();
        // only add individuals that have observations (map requirement)
        if (action.type != 'removed' && individual.last_observation_date) {
          cachedData.push({ id: action.payload.doc.id, ...individual });
        }
        if (individual.modified instanceof Timestamp) {
          cacheTs = Math.max(cacheTs, individual.modified.toMillis());
        }
      });
      return { cacheTs: cacheTs, cachedData: cachedData };
    } else {
      throw Error('empty action arrays must be filtered');
    }
  }

  private updateLocalCache(year: number, lastModified: number, individuals: (Individual & IdLike)[]): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.localService.localStorageSet(
      `${this.CACHE_PREFIX}_${year}`,
      compress(JSON.stringify([lastModified, individuals]))
    );
  }

  private removeLocalCache(year: number) {
    this.localService.localStorageRemove(`${this.CACHE_PREFIX}_${year}`);
  }

  /**
   * Clears local cache for the currently loaded year.
   */
  public clearLocalCache(): void {
    if (this.cachedData$.value.length > 0) {
      const year = this.cachedData$.value[0].year;
      console.log(`Clear Cache for ${year}`);
      this.removeLocalCache(year);
    }
  }
}
