import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, publishReplay, refCount, mergeAll } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../core/base.service';
import { Individual } from '../individual/individual';
import { AlertService } from '../messaging/alert.service';
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
import * as config from '../../assets/config_static.json';


export interface MasterdataCollection { [index: string]: Object; }

@Injectable()
export class MasterdataService extends BaseService {
  constructor(alertService: AlertService, private authService: AuthService) {
    super(alertService);
  }

  //todo fixme
  public availableYears = [2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011];

  public getColor(phenophase: string) {
    return config.phenophases[phenophase].color;
  }

  getIndividualIconPath(species: string, source: string, phenophase: string): string {
    let phaenoIndex = 1;
    if (phenophase) {
      phaenoIndex = config.phenophases[phenophase].icon_index;
    }
    if (source === 'meteoswiss') {
        return '/assets/img/map_pins/map_pin_meteoschweiz.png';
    } else {
        return '/assets/img/map_pins/map_pin_' + species.toLowerCase() + '_' + phaenoIndex + '.png';
    }
  }

  individualToIcon(individual: Individual): google.maps.Icon {
    let icon: google.maps.Icon;
    const icon_path = this.getIndividualIconPath(individual.species, individual.source, individual.last_phenophase)
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
    return this.getMasterdataFor(config.species);
  }

  /**
   * Species that can be selected for creating new individuals.
   */
  getSelectableSpecies(): Observable<Species[]> {
    return this.getSpecies().pipe(map(species => species.filter(s => s.tenant === 'all' || s.tenant === 'globe')));
  }

  getHabitats(): Observable<Habitat[]> {
    return this.getMasterdataFor(config.habitat);
  }

  getDescriptions(): Observable<Description[]> {
    return this.getMasterdataFor(config.description);
  }

  getExpositions(): Observable<Exposition[]> {
    return this.getMasterdataFor(config.exposition);
  }

  getForests(): Observable<Forest[]> {
    return this.getMasterdataFor(config.forest);
  }

  getShades(): Observable<Shade[]> {
    return this.getMasterdataFor(config.shade);
  }

  getDistances(): Observable<Distance[]> {
    return this.getMasterdataFor(config.less100);
  }

  getIrrigations(): Observable<Irrigation[]> {
    return this.getMasterdataFor(config.watering);
  }

  getComments(): Observable<Comment[]> {
    return this.getMasterdataFor(config.comments);
  }

  getSpeciesValue(id: string): Observable<Species> {
    return this.getMasterdataValueFor(config.species, id);
  }

  getHabitatValue(id: string): Observable<Habitat> {
    return this.getMasterdataValueFor(config.habitat, id);
  }

  getDescriptionValue(id: string): Observable<Description> {
    return this.getMasterdataValueFor(config.description, id);
  }

  getExpositionValue(id: string): Observable<Exposition> {
    return this.getMasterdataValueFor(config.exposition, id);
  }

  getForestValue(id: string): Observable<Forest> {
    return this.getMasterdataValueFor(config.forest, id);
  }

  getShadeValue(id: string): Observable<Shade> {
    return this.getMasterdataValueFor(config.shade, id);
  }

  getDistanceValue(id: string): Observable<Distance> {
    return this.getMasterdataValueFor(config.less100, id);
  }

  getIrrigationValue(id: string): Observable<Irrigation> {
    return this.getMasterdataValueFor(config.watering, id);
  }

  getCommentValue(id: string): Observable<Comment> {
    return this.getMasterdataValueFor(config.comments, id);
  }

  getPhenophases(speciesId: string): Observable<Phenophase[]> {
    return this.getPhenoDataFor(speciesId, 'phenophases');
  }

  getPhenophasesFromIndividual(individual: Observable<Individual>) {
    return individual.pipe(map(i => this.getPhenophases(i.species)), mergeAll());
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
    return Object.entries(masterdataLikeObjects).map(([key, value]) => ({ 'id': key, ...value} as T));
  }

  private getMasterdataValueFor<T extends MasterdataLike>(
    data: MasterdataCollection,
    id: string
  ): Observable<T> {
    return this.getMasterdataFor<T>(data).pipe(
      map(elements => elements.find(element => element.id === id)),
      publishReplay(1),
      refCount()
    );
  }

  private getPhenoDataFor<T extends PhenophasesdataLike>(speciesId: string, name: string): Observable<T[]> {
    return of(this.toMasterdatalikeList<T>(config.species[speciesId][name]).sort((n1, n2) => {
      if (n1.seq > n2.seq) {
          return 1;
      }
      if (n1.seq < n2.seq) {
          return -1;
      }
      return 0;
    }));
  }

  private getPhenoDataValueFor<T extends PhenophasesdataLike>(
    speciesId: string,
    name: string,
    id: string
  ): Observable<T> {
    return this.getPhenoDataFor<T>(speciesId, name).pipe(map(elements => elements.find(element => element.id === id)));
  }
}
