import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';
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

export type MasterdataType =
  | 'species'
  | 'habitat'
  | 'description'
  | 'exposition'
  | 'forest'
  | 'shade'
  | 'less100'
  | 'watering'
  | 'comments';

export type ReferenceType = 'individuals' | 'observations';

@Injectable()
export class MasterdataService extends BaseService {
  constructor(alertService: AlertService, private authService: AuthService, private afs: AngularFirestore) {
    super(alertService);
  }

  // temporary solution
  public colorMap = {
    KNS: '#4b9f6f',
    KNV: '#4b9f6f',
    BEA: '#7bb53b',
    BES: '#7bb53b',
    BLA: '#e8d439',
    BLB: '#e8d439',
    BLE: '#e8d439',
    FRA: '#e8b658',
    FRB: '#e8b658',
    BVA: '#b29976',
    BVS: '#b29976',
    BFA: '#868072'
  };

  public phenophaseIndex = {
    KNS: 1,
    KNV: 1,
    BEA: 2,
    BES: 2,
    BLA: 3,
    BLB: 3,
    BLE: 3,
    FRA: 4,
    FRB: 4,
    BVA: 5,
    BVS: 5,
    BFA: 6
  };

  public availableYears = [2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011];

  getIndividualIconPath(species: string, source: string, phenophase: string): string {
    let phaenoIndex = 1;
    if (phenophase) {
      phaenoIndex = this.phenophaseIndex[phenophase];
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
    return this.getMasterdataFor('individuals', 'species');
  }

  getSelectableSpecies(): Observable<Species[]> {
    return this.getSpecies().pipe(map(species => species.filter(s => s.tenant === 'ALL' || s.tenant === 'GLOBE_CH')));
  }

  getHabitats(): Observable<Habitat[]> {
    return this.getMasterdataFor('individuals', 'habitat');
  }

  getDescriptions(): Observable<Description[]> {
    return this.getMasterdataFor('individuals', 'description');
  }

  getExpositions(): Observable<Exposition[]> {
    return this.getMasterdataFor('individuals', 'exposition');
  }

  getForests(): Observable<Forest[]> {
    return this.getMasterdataFor('individuals', 'forest');
  }

  getShades(): Observable<Shade[]> {
    return this.getMasterdataFor('individuals', 'shade');
  }

  getDistances(): Observable<Distance[]> {
    return this.getMasterdataFor('individuals', 'less100');
  }

  getIrrigations(): Observable<Irrigation[]> {
    return this.getMasterdataFor('individuals', 'watering');
  }

  getComments(): Observable<Comment[]> {
    return this.getMasterdataFor('observations', 'comments');
  }

  getSpeciesValue(id: string): Observable<Species> {
    return this.getMasterdataValueFor('individuals', 'species', id);
  }

  getHabitatValue(id: string): Observable<Habitat> {
    return this.getMasterdataValueFor('individuals', 'habitat', id);
  }

  getDescriptionValue(id: string): Observable<Description> {
    return this.getMasterdataValueFor('individuals', 'description', id);
  }

  getExpositionValue(id: string): Observable<Exposition> {
    return this.getMasterdataValueFor('individuals', 'exposition', id);
  }

  getForestValue(id: string): Observable<Forest> {
    return this.getMasterdataValueFor('individuals', 'forest', id);
  }

  getShadeValue(id: string): Observable<Shade> {
    return this.getMasterdataValueFor('individuals', 'shade', id);
  }

  getDistanceValue(id: string): Observable<Distance> {
    return this.getMasterdataValueFor('individuals', 'less100', id);
  }

  getIrrigationValue(id: string): Observable<Irrigation> {
    return this.getMasterdataValueFor('individuals', 'watering', id);
  }

  getCommentValue(id: string): Observable<Comment> {
    return this.getMasterdataValueFor('observations', 'comments', id);
  }

  getPhenophases(speciesId: string): Observable<Phenophase[]> {
    return this.getPhenoDataFor(speciesId, 'phenophases');
  }

  getPhenophaseValue(speciesId: string, phenophase: string): Observable<Phenophase> {
    return this.getPhenoDataValueFor(speciesId, 'phenophases', phenophase);
  }

  getPhenophaseGroups(speciesId: string): Observable<PhenophaseGroup[]> {
    return this.getPhenoDataFor(speciesId, 'groups');
  }

  private getMasterdataFor<T extends MasterdataLike>(reference: ReferenceType, name: MasterdataType): Observable<T[]> {
    return this.afs
      .collection('definitions')
      .doc(reference)
      .collection<T>(name)
      .valueChanges({ idField: 'id' })
      .pipe(publishReplay(1), refCount());
  }

  private getMasterdataValueFor<T extends MasterdataLike>(
    reference: ReferenceType,
    name: MasterdataType,
    id: string
  ): Observable<T> {
    return this.getMasterdataFor<T>(reference, name).pipe(
      map(elements => elements.find(element => element.id === id)),
      publishReplay(1),
      refCount()
    );
  }

  private getPhenoDataFor<T extends PhenophasesdataLike>(speciesId: string, name: string): Observable<T[]> {
    return this.afs
      .collection('definitions')
      .doc('individuals')
      .collection('species')
      .doc(speciesId)
      .collection<T>(name, ref => ref.orderBy('seq'))
      .valueChanges({ idField: 'id' })
      .pipe(publishReplay(1), refCount());
  }

  private getPhenoDataValueFor<T extends PhenophasesdataLike>(
    speciesId: string,
    name: string,
    id: string
  ): Observable<T> {
    return this.getPhenoDataFor<T>(speciesId, name).pipe(map(elements => elements.find(element => element.id === id)));
  }
}
