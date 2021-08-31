import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of, Subscription } from 'rxjs';
import { map, mergeAll, publishReplay, refCount, shareReplay } from 'rxjs/operators';
import configStatic from '../../assets/config_static.json';
import { BaseService } from '../core/base.service';
import { LanguageService } from '../core/language.service';
import { Individual } from '../individual/individual';
import { AlertService } from '../messaging/alert.service';
import { AltitudeLimits } from './altitude-limits';
import { Comment } from './comment';
import { Description } from './description';
import { Distance } from './distance';
import { Exposition } from './exposition';
import { Forest } from './forest';
import { Habitat } from './habitat';
import { Irrigation } from './irrigation';
import { MasterdataLike, PhenophasesdataLike } from './masterdata-like';
import { Phenophase } from './phaenophase';
import { PhenophaseGroup } from './phaenophase-group';
import { Shade } from './shade';
import { Species } from './species';

export interface MasterdataCollection {
  [index: string]: Object;
}

export interface AltitudeLimitsConfig {
  [species: string]: { [phenophase: string]: AltitudeLimits };
}
export interface ConfigDynamic {
  phenoyear: number;
  first_year: number;
  limits: AltitudeLimitsConfig;
}

@Injectable()
export class MasterdataService extends BaseService implements OnDestroy {
  private subscriptions = new Subscription();
  public availableYears$: Observable<number[]>;
  public phenoYear$: Observable<number>;
  private phenoYear: number;
  private configDynamic$: Observable<ConfigDynamic>;
  private configDynamic: ConfigDynamic;

  constructor(alertService: AlertService, private afs: AngularFirestore, private languageService: LanguageService) {
    super(alertService);
    this.configDynamic$ = this.afs
      .collection<any>('definitions')
      .doc<ConfigDynamic>('config_dynamic')
      .valueChanges()
      .pipe(shareReplay(1));
    this.availableYears$ = this.configDynamic$.pipe(
      map(config => this.range(config.phenoyear, config.first_year - 1, -1))
    );
    this.phenoYear$ = this.availableYears$.pipe(
      map(years => years[0]),
      shareReplay(1)
    );

    this.subscriptions.add(this.phenoYear$.subscribe(year => (this.phenoYear = year)));
    this.subscriptions.add(this.configDynamic$.subscribe(config => (this.configDynamic = config)));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public getColor(phenophase: string) {
    return configStatic.phenophases[phenophase].color;
  }

  public getPhenoYear() {
    return this.phenoYear;
  }

  public getLimits(species: string, phenophase: string) {
    return this.configDynamic.limits[species][phenophase];
  }

  getIndividualIconPath(species: string, source: string, phenophase: string): string {
    let phaenoIndex = 1;
    if (phenophase) {
      phaenoIndex = configStatic.phenophases[phenophase].icon_index;
    }
    if (source === 'meteoswiss') {
      return '/assets/img/map_pins/map_pin_meteoschweiz.png';
    } else {
      return (
        '/assets/img/map_pins/' +
        this.languageService.determineCurrentLang() +
        '/map_pin_' +
        species.toLowerCase() +
        '_' +
        phaenoIndex +
        '.png'
      );
    }
  }

  individualToIcon(individual: Individual): google.maps.Icon {
    let icon: google.maps.Icon;
    const icon_path = this.getIndividualIconPath(individual.species, individual.source, individual.last_phenophase);
    if (individual.source === 'meteoswiss') {
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
    return this.getMasterdataFor(configStatic.species);
  }

  /**
   * Species that can be selected for creating new individuals.
   */
  getSelectableSpecies(): Observable<Species[]> {
    return this.getSpecies().pipe(map(species => species.filter(s => s.tenant === 'all' || s.tenant === 'globe')));
  }

  getHabitats(): Observable<Habitat[]> {
    return this.getMasterdataFor(configStatic.habitat);
  }

  getDescriptions(): Observable<Description[]> {
    return this.getMasterdataFor(configStatic.description);
  }

  getExpositions(): Observable<Exposition[]> {
    return this.getMasterdataFor(configStatic.exposition);
  }

  getForests(): Observable<Forest[]> {
    return this.getMasterdataFor(configStatic.forest);
  }

  getShades(): Observable<Shade[]> {
    return this.getMasterdataFor(configStatic.shade);
  }

  getDistances(): Observable<Distance[]> {
    return this.getMasterdataFor(configStatic.less100);
  }

  getIrrigations(): Observable<Irrigation[]> {
    return this.getMasterdataFor(configStatic.watering);
  }

  getComments(): Observable<Comment[]> {
    return this.getMasterdataFor(configStatic.comments);
  }

  getSpeciesValue(id: string): Observable<Species> {
    return this.getMasterdataValueFor(configStatic.species, id);
  }

  getHabitatValue(id: string): Observable<Habitat> {
    return this.getMasterdataValueFor(configStatic.habitat, id);
  }

  getDescriptionValue(id: string): Observable<Description> {
    return this.getMasterdataValueFor(configStatic.description, id);
  }

  getExpositionValue(id: string): Observable<Exposition> {
    return this.getMasterdataValueFor(configStatic.exposition, id);
  }

  getForestValue(id: string): Observable<Forest> {
    return this.getMasterdataValueFor(configStatic.forest, id);
  }

  getShadeValue(id: string): Observable<Shade> {
    return this.getMasterdataValueFor(configStatic.shade, id);
  }

  getDistanceValue(id: string): Observable<Distance> {
    return this.getMasterdataValueFor(configStatic.less100, id);
  }

  getIrrigationValue(id: string): Observable<Irrigation> {
    return this.getMasterdataValueFor(configStatic.watering, id);
  }

  getCommentValue(id: string): Observable<Comment> {
    return this.getMasterdataValueFor(configStatic.comments, id);
  }

  getPhenophases(speciesId: string): Observable<Phenophase[]> {
    return this.getPhenoDataFor(speciesId, 'phenophases');
  }

  getPhenophasesFromIndividual(individual: Observable<Individual>) {
    return individual.pipe(
      map(i => this.getPhenophases(i.species)),
      mergeAll()
    );
  }

  getPhenophaseValue(speciesId: string, phenophase: string): Observable<Phenophase> {
    return this.getPhenoDataValueFor(speciesId, 'phenophases', phenophase);
  }

  getPhenophaseGroups(speciesId: string): Observable<PhenophaseGroup[]> {
    return this.getPhenoDataFor(speciesId, 'groups');
  }

  private getMasterdataFor<T extends MasterdataLike>(data: MasterdataCollection): Observable<T[]> {
    return of(this.toMasterdatalikeList<T>(data));
  }

  private toMasterdatalikeList<T extends MasterdataLike>(masterdataLikeObjects: MasterdataCollection): T[] {
    return Object.entries(masterdataLikeObjects).map(([key, value]) => ({ id: key, ...value } as T));
  }

  private getMasterdataValueFor<T extends MasterdataLike>(data: MasterdataCollection, id: string): Observable<T> {
    return this.getMasterdataFor<T>(data).pipe(
      map(elements => elements.find(element => element.id === id)),
      publishReplay(1),
      refCount()
    );
  }

  private getPhenoDataFor<T extends PhenophasesdataLike>(speciesId: string, name: string): Observable<T[]> {
    return of(
      this.toMasterdatalikeList<T>(configStatic.species[speciesId][name]).sort((n1, n2) => {
        if (n1.seq > n2.seq) {
          return 1;
        }
        if (n1.seq < n2.seq) {
          return -1;
        }
        return 0;
      })
    );
  }

  private getPhenoDataValueFor<T extends PhenophasesdataLike>(
    speciesId: string,
    name: string,
    id: string
  ): Observable<T> {
    return this.getPhenoDataFor<T>(speciesId, name).pipe(map(elements => elements.find(element => element.id === id)));
  }

  private range(start: number, stop: number, step = 1) {
    if (typeof stop === 'undefined') {
      // one param defined
      stop = start;
      start = 0;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return [];
    }

    const result = [];
    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
      result.push(i);
    }

    return result;
  }
}
