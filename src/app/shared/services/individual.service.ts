import { Injectable } from '@angular/core';
import { Firestore, limit, where } from '@angular/fire/firestore';
import { deleteObject, getDownloadURL, ref, Storage } from '@angular/fire/storage';
import { IdLike } from '@core/core.model';
import { AuthService } from '@core/services/auth.service';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { IndividualPhenophase } from '@shared/models/individual-phenophase.model';
import { Individual, SensorLiveData } from '@shared/models/individual.model';
import { Phenophase, Species } from '@shared/models/masterdata.model';
import { MasterdataService } from '@shared/services/masterdata.service';
import { formatShortDate, formatShortDateTime } from '@shared/utils/formatDate';
import { combineLatest, from, Observable, of } from 'rxjs';
import { first, map, mergeAll, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class IndividualService extends BaseResourceService<Individual> {
  individualsByYear$$: Map<number, Observable<(Individual & IdLike)[]>>;
  constructor(
    protected afs: Firestore,
    private authService: AuthService,
    private afStorage: Storage,
    private masterdataService: MasterdataService,
    protected fds: FirestoreDebugService
  ) {
    super(afs, 'individuals', fds);
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
      individual.individual = this.createId();
      individual.user = this.authService.getUserId();
    }

    if (individual.year === undefined) {
      individual.year = this.masterdataService.getPhenoYear();
    }

    return super.upsert(individual, `${individual.year}_${individual.individual}`);
  }

  listByUserAndYear(userId: string, year: number, limitAmount: number = 1000): Observable<(Individual & IdLike)[]> {
    return this.queryCollection(where('user', '==', userId), where('year', '==', year), limit(limitAmount)).pipe(
      tap(x => this.fds.addRead(`${this.collectionName} (listByUserAndYear)`, x.length))
    );
  }

  listByUserAndSpecies(
    userId: string,
    year: number,
    species: string,
    limitAmount: number = 1000
  ): Observable<(Individual & IdLike)[]> {
    return this.queryCollection(
      where('user', '==', userId),
      where('year', '==', year),
      where('species', '==', species),
      limit(limitAmount)
    ).pipe(tap(x => this.fds.addRead(`${this.collectionName} (listByUserAndSpecies)`, x.length)));
  }

  listByIds(individuals: string[], year: number, limitAmount: number = 100): Observable<(Individual & IdLike)[]> {
    const chunkSize = 10; // Maximum number of values for each "in" operator
    const chunks = [];

    // Split individuals array into chunks
    for (let i = 0; i < individuals.length; i += chunkSize) {
      chunks.push(individuals.slice(i, i + chunkSize));
    }

    return combineLatest(
      chunks.map(chunk =>
        this.queryCollection(where('individual', 'in', chunk), where('year', '==', year), limit(limitAmount))
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
    return this.queryCollection(where('individual', '==', individual)).pipe(
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

    return from(getDownloadURL(ref(this.afStorage, path)).catch(() => null)) as Observable<string | null>;
  }

  deleteImages(individual: Individual): void {
    deleteObject(ref(this.afStorage, this.getImagePath(individual, true))).catch(() => null); // ignore if image does not exist
    deleteObject(ref(this.afStorage, this.getImagePath(individual, false))).catch(() => null); // ignore if image does not exist
  }

  composedId(individual: Individual): string {
    return `${individual.year}_${individual.individual}`;
  }
}
