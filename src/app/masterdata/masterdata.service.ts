import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { publishReplay, refCount, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseService } from '../core/base.service';
import { AlertService } from '../messaging/alert.service';
import { Description } from './description';
import { Exposition } from './exposition';
import { Forest } from './forest';
import { Habitat } from './habitat';
import { Shade } from './shade';
import { Species } from './species';
import { Distance } from './distance';
import { Irrigation } from './irrigation';
import { MasterdataLike, PhenophasesdataLike } from './masterdata-like';
import { Phenophase } from './phaenophase';
import { PhenophaseGroup } from './phaenophase-group';

export type MasterdataType =
  | 'species'
  | 'habitat'
  | 'description'
  | 'exposition'
  | 'forest'
  | 'shade'
  | 'less100'
  | 'watering';

@Injectable()
export class MasterdataService extends BaseService {
  constructor(alertService: AlertService, private authService: AuthService, private afs: AngularFirestore) {
    super(alertService);
  }

  /*
   *  Here follows a list of boilerplate code to allow safer usage. Maybe discuss if we rather want to expose the generic methods.
   */

  getSpecies(): Observable<Species[]> {
    return this.getMasterdataFor('species');
  }

  getHabitats(): Observable<Habitat[]> {
    return this.getMasterdataFor('habitat');
  }

  getDescriptions(): Observable<Description[]> {
    return this.getMasterdataFor('description');
  }

  getExpositions(): Observable<Exposition[]> {
    return this.getMasterdataFor('exposition');
  }

  getForests(): Observable<Forest[]> {
    return this.getMasterdataFor('forest');
  }

  getShades(): Observable<Shade[]> {
    return this.getMasterdataFor('shade');
  }

  getDistances(): Observable<Distance[]> {
    return this.getMasterdataFor('less100');
  }

  getIrrigations(): Observable<Irrigation[]> {
    return this.getMasterdataFor('watering');
  }

  getSpeciesValue(id: string): Observable<Species> {
    return this.getMasterdataValueFor('species', id);
  }

  getHabitatValue(id: string): Observable<Habitat> {
    return this.getMasterdataValueFor('habitat', id);
  }

  getDescriptionValue(id: string): Observable<Description> {
    return this.getMasterdataValueFor('description', id);
  }

  getExpositionValue(id: string): Observable<Exposition> {
    return this.getMasterdataValueFor('exposition', id);
  }

  getForestValue(id: string): Observable<Forest> {
    return this.getMasterdataValueFor('forest', id);
  }

  getShadeValue(id: string): Observable<Shade> {
    return this.getMasterdataValueFor('shade', id);
  }

  getDistanceValue(id: string): Observable<Distance> {
    return this.getMasterdataValueFor('less100', id);
  }

  getIrrigationValue(id: string): Observable<Irrigation> {
    return this.getMasterdataValueFor('watering', id);
  }

  getPhenophases(speciesId: string): Observable<Phenophase[]> {
    return this.getPhenoDataFor(speciesId, 'phenophases');
  }

  getPhenophaseValue(speciesId: string, id: string): Observable<Phenophase> {
    return this.getPhenoDataValueFor(speciesId, 'phenophases', id);
  }

  getPhenophaseGroups(speciesId: string): Observable<PhenophaseGroup[]> {
    return this.getPhenoDataFor(speciesId, 'groups');
  }

  private getMasterdataFor<T extends MasterdataLike>(name: MasterdataType): Observable<T[]> {
    return this.afs
      .collection('definitions')
      .doc('individuals')
      .collection<T>(name)
      .valueChanges({ idField: 'id' })
      .pipe(publishReplay(1), refCount());
  }

  private getMasterdataValueFor<T extends MasterdataLike>(name: MasterdataType, id: string): Observable<T> {
    return this.getMasterdataFor<T>(name).pipe(
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
