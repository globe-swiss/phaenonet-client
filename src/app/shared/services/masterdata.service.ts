import { Injectable, OnDestroy, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore } from '@angular/fire/firestore';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { LanguageService } from '@core/services/language.service';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { map, mergeAll, publishReplay, refCount, shareReplay, tap } from 'rxjs/operators';
import configStatic_import from '~/assets/config_static.json';
import { environment } from '~/environments/environment';
import { AltitudeLimits } from '../models/altitude-limits.model';
import { hasSensor, Individual, MapIndividual } from '../models/individual.model';
import {
  Comment,
  Description,
  Distance,
  Exposition,
  Forest,
  Habitat,
  Irrigation,
  MasterdataLike,
  Phenophase,
  PhenophaseGroup,
  Shade,
  SortedMasterdataLike,
  Species
} from '../models/masterdata.model';
import { Roles } from '../models/user-roles.enum';

export interface MasterdataCollection {
  [index: string]: Record<string, unknown>;
}

interface AltitudeLimitsConfig {
  [species: string]: { [phenophase: string]: AltitudeLimits };
}
interface ConfigDynamic {
  phenoyear: number;
  first_year: number;
  limits: AltitudeLimitsConfig;
}

interface ConfigStaticItems {
  [id: string]: { de: string; seq: number };
}

interface ConfigStaticSpecies {
  [id: string]: {
    de: string;
    groups: { [id: string]: { de: string; seq: number; color: string } };
    phenophases: {
      [id: string]: { comments?: string[]; de: string; description_de: string; group_id: string; seq: number };
    };
    sources: string[];
  };
}

interface ConfigStatic {
  comments: ConfigStaticItems;
  description: ConfigStaticItems;
  exposition: ConfigStaticItems;
  forest: ConfigStaticItems;
  habitat: ConfigStaticItems;
  less100: ConfigStaticItems;
  phenophases: { [id: string]: { color: string; icon_index: number } };
  shade: ConfigStaticItems;
  watering: ConfigStaticItems;
  species: ConfigStaticSpecies;
}

@Injectable({ providedIn: 'root' })
export class MasterdataService extends BaseResourceService<unknown> implements OnDestroy {
  private subscriptions = new Subscription();
  public availableYears$: Observable<number[]>;
  public phenoYear$: Observable<number>;
  public phenoYear: Signal<number>;
  private configDynamic$: Observable<ConfigDynamic>;
  private configDynamic: ConfigDynamic;
  private configStatic = <ConfigStatic>configStatic_import;

  constructor(
    protected afs: Firestore,
    private languageService: LanguageService,
    protected fds: FirestoreDebugService
  ) {
    super(afs, 'definitions', fds);
    this.configDynamic$ = this.get('config_dynamic').pipe(
      tap(() => this.fds.addRead('config_dynamic')),
      shareReplay(1)
    ) as Observable<ConfigDynamic>;
    this.availableYears$ = this.configDynamic$.pipe(
      map(config => this.range(config.phenoyear, config.first_year - 1, -1))
    );
    this.phenoYear$ = this.availableYears$.pipe(
      map(years => years[0]),
      shareReplay(1)
    );

    this.phenoYear = toSignal(this.phenoYear$);
    this.subscriptions.add(this.configDynamic$.subscribe(config => (this.configDynamic = config)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public getColor(phenophase: string): string | null {
    return this.configStatic.phenophases[phenophase]?.color;
  }

  /**
   * @deprecated use signal phenoYear instead
   * @returns
   */
  public getPhenoYear(): number {
    return this.phenoYear();
  }

  public getLimits(species: string, phenophase: string): AltitudeLimits | null {
    try {
      return this.configDynamic.limits[species][phenophase];
    } catch {
      if (!environment.production) {
        console.warn(`No limits found for ${species}.${phenophase}`);
      }
      return null;
    }
  }

  getIndividualIconPath(species: string, has_sensor: boolean = false, source?: string, phenophase?: string): string {
    let phaenoIndex = 1;
    if (phenophase) {
      phaenoIndex = this.configStatic.phenophases[phenophase]?.icon_index;
    }
    if (source === 'meteoswiss') {
      return '/assets/img/map_pins/map_pin_meteoschweiz.png';
    } else if (source === 'wld') {
      return '/assets/img/map_pins/map_pin_wld.png';
    } else {
      const lang = `${this.languageService.determineCurrentLang()}`;
      const generated = has_sensor ? 'generated/' : '';
      const iconName = `map_pin_${species.toLowerCase()}_${phaenoIndex}${has_sensor ? '_+' : ''}.png`;
      return `/assets/img/map_pins/${lang}/${generated}${iconName}`;
    }
  }

  individualToIcon(individual: Individual | MapIndividual): google.maps.Icon {
    let icon: google.maps.Icon;
    const icon_path = this.getIndividualIconPath(
      individual.species,
      hasSensor(individual),
      individual.source,
      individual.last_phenophase
    );
    if (individual.type === 'station') {
      icon = {
        url: icon_path,
        scaledSize: new google.maps.Size(60, 60)
      };
    } else {
      icon = {
        url: icon_path,
        scaledSize: new google.maps.Size(55, 60)
      };
    }

    return icon;
  }

  /*
   *  Here follows a list of boilerplate code to allow safer usage. Maybe discuss if we rather want to expose the generic methods.
   */

  getSpecies(): Observable<Species[]> {
    return this.getMasterdataFor(this.configStatic.species);
  }

  /**
   * Species that can be selected for creating new individuals.
   */
  getObservableSpecies(roles: Observable<string[]>): Observable<Species[]> {
    return combineLatest([this.getSpecies(), roles]).pipe(
      map(([species, roles]) => {
        if (roles.includes(Roles.RANGER)) {
          // PhaenoRanger user can enter data for ranger species
          return species.filter(s => s.sources.includes('ranger'));
        } else {
          // normal PhaenoNet User can enter globe species
          return species.filter(s => s.sources.includes('globe'));
        }
      })
    );
  }

  getHabitats(): Observable<Habitat[]> {
    return this.getSortedMasterdataFor(this.configStatic.habitat);
  }

  getDescriptions(): Observable<Description[]> {
    return this.getSortedMasterdataFor(this.configStatic.description);
  }

  getExpositions(): Observable<Exposition[]> {
    return this.getSortedMasterdataFor(this.configStatic.exposition);
  }

  getForests(): Observable<Forest[]> {
    return this.getSortedMasterdataFor(this.configStatic.forest);
  }

  getShades(): Observable<Shade[]> {
    return this.getSortedMasterdataFor(this.configStatic.shade);
  }

  getDistances(): Observable<Distance[]> {
    return this.getSortedMasterdataFor(this.configStatic.less100);
  }

  getIrrigations(): Observable<Irrigation[]> {
    return this.getSortedMasterdataFor(this.configStatic.watering);
  }

  getComments(): Observable<Comment[]> {
    return this.getSortedMasterdataFor(this.configStatic.comments);
  }

  getSpeciesValue(id: string): Observable<Species> {
    return this.getMasterdataValueFor(this.configStatic.species, id);
  }

  getHabitatValue(id: string): Observable<Habitat> {
    return this.getSortedMasterdataValueFor(this.configStatic.habitat, id);
  }

  getDescriptionValue(id: string): Observable<Description> {
    return this.getSortedMasterdataValueFor(this.configStatic.description, id);
  }

  getExpositionValue(id: string): Observable<Exposition> {
    return this.getSortedMasterdataValueFor(this.configStatic.exposition, id);
  }

  getForestValue(id: string): Observable<Forest> {
    return this.getSortedMasterdataValueFor(this.configStatic.forest, id);
  }

  getShadeValue(id: string): Observable<Shade> {
    return this.getSortedMasterdataValueFor(this.configStatic.shade, id);
  }

  getDistanceValue(id: string): Observable<Distance> {
    return this.getSortedMasterdataValueFor(this.configStatic.less100, id);
  }

  getIrrigationValue(id: string): Observable<Irrigation> {
    return this.getSortedMasterdataValueFor(this.configStatic.watering, id);
  }

  getCommentValue(id: string): Observable<Comment> {
    return this.getSortedMasterdataValueFor(this.configStatic.comments, id);
  }

  getPhenophases(speciesId: string): Observable<Phenophase[]> {
    // return this.getPhenoDataFor(speciesId, 'phenophases');
    return this.getSortedMasterdataFor(this.configStatic.species[speciesId]['phenophases']);
  }

  getPhenophasesFromIndividual(individual: Observable<Individual>): Observable<Phenophase[]> {
    return individual.pipe(
      map(i => this.getPhenophases(i.species)),
      mergeAll()
    );
  }

  getPhenophaseValue(speciesId: string, phenophase: string): Observable<Phenophase> {
    return this.getSortedMasterdataValueFor(this.configStatic.species[speciesId]['phenophases'], phenophase);
  }

  getPhenophaseGroups(speciesId: string): Observable<PhenophaseGroup[]> {
    return this.getSortedMasterdataFor(this.configStatic.species[speciesId]['groups']);
  }

  private toMasterdatalikeList<T extends MasterdataLike>(masterdataLikeObjects: MasterdataCollection): T[] {
    return Object.entries(masterdataLikeObjects).map(([key, value]) => ({ id: key, ...value }) as T);
  }

  private getMasterdataFor<T extends MasterdataLike>(data: MasterdataCollection): Observable<T[]> {
    return of(this.toMasterdatalikeList<T>(data));
  }

  private getMasterdataValueFor<T extends MasterdataLike>(data: MasterdataCollection, id: string): Observable<T> {
    return this.getMasterdataFor<T>(data).pipe(
      map(elements => elements.find(element => element.id === id)),
      publishReplay(1),
      refCount()
    );
  }

  private getSortedMasterdataFor<T extends SortedMasterdataLike>(data: MasterdataCollection): Observable<T[]> {
    return of(this.toMasterdatalikeList<T>(data).sort((n1, n2) => n1.seq - n2.seq));
  }

  private getSortedMasterdataValueFor<T extends SortedMasterdataLike>(
    data: MasterdataCollection,
    id: string
  ): Observable<T> {
    return this.getSortedMasterdataFor<T>(data).pipe(
      map(elements => elements.find(element => element.id === id)),
      publishReplay(1),
      refCount()
    );
  }

  private range(start: number, stop?: number, step = 1): number[] {
    const result: number[] = [];
    if (typeof stop === 'undefined') {
      // one param defined
      stop = start;
      start = 0;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return result;
    }

    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
      result.push(i);
    }

    return result;
  }

  public sortTranslatedMasterData<T extends MasterdataLike>(records: Array<T>): Array<T> {
    return records.sort((m1, m2) => this.languageService.sortTranslated(m1.de, m2.de));
  }
}
