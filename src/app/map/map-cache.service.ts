import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  CollectionReference,
  DocumentChangeAction,
  DocumentData
} from '@angular/fire/compat/firestore';
import { Timestamp } from '@firebase/firestore';
import { compress, decompress } from 'lz-string';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Individual } from '../individual/individual';
import { IdLike } from '../masterdata/masterdata-like';
import { FirestoreDebugService } from '../shared/firestore-debug.service';

@Injectable()
export class MapCacheService {
  private readonly CACHE_VERSION = 1;
  private readonly CACHE_VERSION_KEY = 'mapCacheVersion';
  private readonly CACHE_PREFIX = 'cacheind';
  private readonly CACHETS_PREFIX = 'cachets';
  private cached_data$: BehaviorSubject<(Individual & IdLike)[]> = new BehaviorSubject(
    new Array<Individual & IdLike>()
  );
  private cache_ts: Map<number, number> = new Map();
  private cache_subscription: Subscription = new Subscription();

  constructor(protected afs: AngularFirestore, protected fds: FirestoreDebugService) {
    this.checkVersion();
  }

  getIndividuals(year: number): Observable<(Individual & IdLike)[]> {
    this.cache_subscription.unsubscribe();
    // ignore if year is not set
    if (year > 0) {
      console.log(`load map cache for ${year}`);
      let mapCache: (Individual & IdLike)[];
      try {
        mapCache = this.loadLocalCache(year);
      } catch (error) {
        console.log('Error loading map cache');
        console.log(error);

        mapCache = new Array<Individual & IdLike>();
        this.removeCache(year);
      }
      this.cached_data$ = new BehaviorSubject(mapCache);
      this.cache_subscription = this.setupCacheListener(year).subscribe();
    }
    return this.cached_data$;
  }

  private loadLocalCache(year: number): (Individual & IdLike)[] {
    const localData = localStorage.getItem(`${this.CACHE_PREFIX}_${year}`);
    // do not process and push data if local storage was empty
    if (localData) {
      const cachedData = JSON.parse(decompress(localData)) as (Individual & IdLike)[];
      // restore timestamp objects
      cachedData.map(x => {
        if (x['last_observation_date']) {
          x['last_observation_date'] = new Timestamp(
            x['last_observation_date']['seconds'],
            x['last_observation_date']['nanoseconds']
          );
        }
      });
      return cachedData;
    } else {
      return [];
    }
  }

  private updateCache(year: number, individuals: (Individual & IdLike)[]): void {
    console.log(`update cache for ${year}`);

    this.cached_data$.next(individuals);
    localStorage.setItem(`${this.CACHE_PREFIX}_${year}`, compress(JSON.stringify(individuals)));
  }

  private updateCacheMillis(year: number, ts: number): void {
    this.cache_ts.set(year, Math.max(ts + 0.001, this.getCacheMillis(year))); // add split second to avoid reloading last document
    localStorage.setItem(`${this.CACHETS_PREFIX}_${year}`, ts.toString());
  }

  private getCacheMillis(year: number): number {
    let ts = this.cache_ts.get(year);
    if (!ts) {
      ts = +localStorage.getItem(`${this.CACHETS_PREFIX}_${year}`);
    }
    return ts;
  }

  private removeCache(year: number) {
    localStorage.removeItem(`${this.CACHE_PREFIX}_${year}`);
    localStorage.removeItem(`${this.CACHETS_PREFIX}_${year}`);
  }

  private setupCacheListener(year: number): Observable<DocumentChangeAction<Individual>[]> {
    console.log(
      `listen to changes from changes from ${Timestamp.fromMillis(this.getCacheMillis(year))
        .toDate()
        .toUTCString()} for ${year}`
    );

    return this.afs
      .collection<Individual>('individuals', ref => this.getIndividualQuery(year, ref))
      .stateChanges()
      .pipe(
        tap(actions => this.processActions(year, actions)),
        tap(x => this.fds.addRead(`individuals (setupCache-update)`, x.length))
      );
  }

  private getIndividualQuery(year: number, individual_collection_ref: CollectionReference<DocumentData>) {
    let query = individual_collection_ref.where('year', '==', year);
    // if chache is initialized load all (include individuals without modified field)
    if (this.getCacheMillis(year)) {
      query = query.where('modified', '>', Timestamp.fromMillis(this.getCacheMillis(year)));
    }
    return query;
  }

  private processActions(year: number, actions: DocumentChangeAction<Individual>[]): void {
    // do not process empty action arrays
    if (actions.length > 0) {
      let cached_data = this.cached_data$.value;
      actions.forEach(action => {
        // remove old record from cache
        cached_data = cached_data.filter(x => x['id'] != action.payload.doc.id);
        const modified = action.payload.doc.data()['modified'];
        // only add individuals that have observations (map requirement)
        if (action.type != 'removed' && action.payload.doc.data()['last_observation_date']) {
          cached_data.push({ id: action.payload.doc.id, ...action.payload.doc.data() });
          // ignore cache ts if modified is not set
          if (modified) {
            this.updateCacheMillis(year, (modified as Timestamp).toMillis());
          }
        }
      });
      this.updateCache(year, cached_data);
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
