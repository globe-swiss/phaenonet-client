import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseResourceService } from '../core/base-resource.service';
import { IdLike } from '../masterdata/masterdata-like';
import { MasterdataService } from '../masterdata/masterdata.service';
import { AlertService } from '../messaging/alert.service';
import { Observation } from '../observation/observation';
import { Individual } from './individual';

@Injectable()
export class IndividualService extends BaseResourceService<Individual> {
  constructor(
    alertService: AlertService,
    protected afs: AngularFirestore,
    private authService: AuthService,
    private afStorage: AngularFireStorage,
    private masterdataService: MasterdataService
  ) {
    super(alertService, afs, 'individuals');
  }

  upsert(individual: Individual): Observable<Individual> {
    if (!individual.individual) {
      individual.individual = this.afs.createId();
      individual.user = this.authService.getUserId();
    }

    if (individual.year === undefined) {
      individual.year = this.masterdataService.getPhenoYear();
    }

    return super.upsert(individual, individual.year + '_' + individual.individual);
  }

  listByYear(year: number): Observable<(Individual & IdLike)[]> {
    return this.afs
      .collection<Individual>(this.collectionName, ref =>
        ref.where('year', '==', year).orderBy('last_observation_date', 'desc')
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map(individuals => {
          return individuals.map(i => {
            if (i.last_observation_date) {
              i.last_observation_date = (i.last_observation_date as any).toDate();
            }
            return i;
          });
        })
      );
  }

  /**
   * Get the list of individuals ordered by modified date descending.
   * @param userId the userId, can be public or self.
   * @param limit defaults to 100
   */
  listByUser(userId: string, limit: number = 100): Observable<(Individual & IdLike)[]> {
    return this.afs
      .collection<Individual>(this.collectionName, ref =>
        ref.where('user', '==', userId).orderBy('modified', 'desc').limit(limit)
      )
      .valueChanges({ idField: 'id' });
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
        .catch(_ => null)
    );
  }

  hasObservations(individualId: string) {
    return this.afs
      .collection<Observation>('observations', ref => ref.where('individual_id', '==', individualId).limit(1))
      .valueChanges()
      .pipe(
        map(observations => {
          return observations.length > 0;
        })
      );
  }

  deleteImages(individual: Individual) {
    this.afStorage.storage
      .ref(this.getImagePath(individual, true))
      .delete()
      .catch(reason => {
        if (reason.code !== 'storage/object-not-found') {
          console.log(reason);
        }
      });
    this.afStorage.storage
      .ref(this.getImagePath(individual, false))
      .delete()
      .catch(reason => {
        if (reason.code !== 'storage/object-not-found') {
          console.log(reason);
        }
      });
  }
}
