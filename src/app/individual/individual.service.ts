import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { combineLatest, from, Observable, of } from 'rxjs';
import { first, map, mergeAll, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseResourceService } from '../core/base-resource.service';
import { IdLike } from '../masterdata/masterdata-like';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Phenophase } from '../masterdata/phaenophase';
import { Species } from '../masterdata/species';
import { AlertService } from '../messaging/alert.service';
import { Observation } from '../observation/observation';
import { FirestoreDebugService } from '../shared/firestore-debug.service';
import { Individual, SensorLiveData } from './individual';
import { IndividualPhenophase } from './individual-phenophase';
import { formatShortDate, formatShortDateTime } from '../shared/formatDate';

@Injectable()
export class IndividualService extends BaseResourceService<Individual> {
  individualsByYear$$: Map<number, Observable<(Individual & IdLike)[]>>;
  constructor(
    alertService: AlertService,
    protected afs: AngularFirestore,
    private authService: AuthService,
    private afStorage: AngularFireStorage,
    private masterdataService: MasterdataService,
    protected fds: FirestoreDebugService
  ) {
    super(alertService, afs, 'individuals', fds);
    this.individualsByYear$$ = new Map();
  }

  static formatLastMeasurementDate(sensor: SensorLiveData) {
    if (sensor?.ts) {
      const asDate = new Date(sensor.ts.seconds * 1000);
      return formatShortDate(asDate);
    } else {
      return 'n/a';
    }
  }

  static formatLastMeasurementDateTime(sensor: SensorLiveData) {
    if (sensor?.ts) {
      const asDate = new Date(sensor.ts.seconds * 1000);
      return formatShortDateTime(asDate);
    } else {
      return 'n/a';
    }
  }

  upsert(individual: Individual): Observable<Individual> {
    if (!individual.individual) {
      individual.individual = this.afs.createId();
      individual.user = this.authService.getUserId();
    }

    if (individual.year === undefined) {
      individual.year = this.masterdataService.getPhenoYear();
    }

    return super.upsert(individual, `${individual.year}_${individual.individual}`);
  }

  listByUserAndYear(userId: string, year: number, limit: number = 1000): Observable<(Individual & IdLike)[]> {
    return this.afs
      .collection<Individual>(this.collectionName, ref =>
        ref.where('user', '==', userId).where('year', '==', year).limit(limit)
      )
      .valueChanges({ idField: 'id' })
      .pipe(tap(x => this.fds.addRead(`${this.collectionName} (listByUserAndYear)`, x.length)));
  }

  listByUserAndSpecies(
    userId: string,
    year: number,
    species: string,
    limit: number = 1000
  ): Observable<(Individual & IdLike)[]> {
    return this.afs
      .collection<Individual>(this.collectionName, ref =>
        ref.where('user', '==', userId).where('year', '==', year).where('species', '==', species).limit(limit)
      )
      .valueChanges({ idField: 'id' })
      .pipe(tap(x => this.fds.addRead(`${this.collectionName} (listByUserAndSpecies)`, x.length)));
  }

  listByIds(individuals: string[], year: number, limit: number = 100): Observable<(Individual & IdLike)[]> {
    const chunkSize = 10; // Maximum number of values for each "in" operator
    const chunks = [];

    // Split individuals array into chunks
    for (let i = 0; i < individuals.length; i += chunkSize) {
      chunks.push(individuals.slice(i, i + chunkSize));
    }

    return combineLatest(
      chunks.map(chunk =>
        this.afs
          .collection<Individual>(this.collectionName, ref =>
            ref.where('individual', 'in', chunk).where('year', '==', year).limit(limit)
          )
          .valueChanges({ idField: 'id' })
      )
    ).pipe(
      map(results => results.flat()),
      tap(x => this.fds.addRead(`${this.collectionName} (listByIds)`, x.length))
    );
  }

  // fixme move near component
  getIndividualPhenohases(individuals$: Observable<Individual[]>): Observable<IndividualPhenophase[]> {
    // combine the list of individuals with their phenophase
    return individuals$.pipe(
      map(individuals => {
        if (individuals.length > 0) {
          return combineLatest(
            individuals
              .sort((l, r) => {
                const l_hasnt_last_obs = l.last_observation_date ? false : true;
                const r_hasnt_last_obs = r.last_observation_date ? false : true;
                if (l_hasnt_last_obs && r_hasnt_last_obs) {
                  return 0;
                }
                if (l_hasnt_last_obs) {
                  return r.year - l.year + 0.1;
                }
                if (r_hasnt_last_obs) {
                  return r.year - l.year - 0.1;
                } else {
                  return r.last_observation_date.toMillis() - l.last_observation_date.toMillis();
                }
              })
              .map(individual => {
                return combineLatest([
                  this.masterdataService.getSpeciesValue(individual.species),
                  this.getPhenophaseNameIfDefined(individual)
                ]).pipe(map(([species, phenophase]) => this.getIndividualPhenophase(individual, species, phenophase)));
              })
          );
        } else {
          return of<IndividualPhenophase[]>([]);
        }
      }),
      mergeAll()
    );
  }

  /**
   * Return list of individuals that may be shown in the individual- or station-detail view.
   * Individuals are selectable if they have an observation date or if they are owned by the user and therefore "editable"
   * @param individual the individual shown on the page
   * @returns list of all selectable individuals
   */
  getSelectableIndividuals(individual: string, includeOwned: boolean): Observable<(Individual & IdLike)[]> {
    return this.afs
      .collection<Individual>(this.collectionName, ref => ref.where('individual', '==', individual))
      .valueChanges({ idField: 'id' })
      .pipe(
        tap(x => this.fds.addRead(`${this.collectionName} (getSelectableIndividuals)`, x.length)),
        map(individuals => individuals.filter(i => includeOwned || i.last_observation_date))
      );
  }

  getPhenophaseNameIfDefined(individual: Individual): Observable<Phenophase> {
    // fixme: probably switch on individual.type
    try {
      return this.masterdataService.getPhenophaseValue(individual.species, individual.last_phenophase);
    } catch (error) {
      // fixme: does this case actually happen?
      return of(null as Phenophase);
    }
  }

  getIndividualPhenophase(individual: Individual, species: Species, phenophase: Phenophase): IndividualPhenophase {
    return {
      individual: individual,
      species: species,
      lastPhenophase: phenophase,
      type: individual.type,
      imgUrl$: this.getImageUrl(individual, true).pipe(
        first(),
        map(u => (u === null ? 'assets/img/pic_placeholder.svg' : u))
      )
    } as IndividualPhenophase;
  }

  getImagePath(individual: Individual, thumbnail = false): string {
    return '/images/' + individual.user + '/individuals/' + individual.individual + (thumbnail ? '_tn' : '');
  }

  getImageUrl(individual: Individual, thumbnail = false): Observable<string | null> {
    const path = this.getImagePath(individual, thumbnail);

    return from(
      this.afStorage
        .ref(path)
        .getDownloadURL()
        .toPromise()
        .catch(() => null)
    ) as Observable<string | null>;
  }

  hasObservations(individualId: string): Observable<boolean> {
    return this.afs
      .collection<Observation>('observations', ref => ref.where('individual_id', '==', individualId).limit(1))
      .valueChanges()
      .pipe(
        tap(x => this.fds.addRead('observations (hasObservations)', x.length)),
        map(observations => {
          return observations.length > 0;
        })
      );
  }

  deleteImages(individual: Individual): void {
    this.afStorage.storage
      .ref(this.getImagePath(individual, true))
      .delete()
      .catch(() => null); // ignore if image does not exist
    this.afStorage.storage
      .ref(this.getImagePath(individual, false))
      .delete()
      .catch(() => null); // ignore if image does not exist
  }

  composedId(individual: Individual): string {
    return `${individual.year}_${individual.individual}`;
  }
}
