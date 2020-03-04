import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { Individual } from './individual';
import { AuthService } from '../auth/auth.service';
import { map } from 'rxjs/operators';
import { IdLike } from '../masterdata/masterdata-like';

@Injectable()
export class IndividualService extends BaseResourceService<Individual> {
  constructor(alertService: AlertService, protected afs: AngularFirestore, private authService: AuthService) {
    super(alertService, afs, 'individuals');
  }

  upsert(individual: Individual, id: string): Observable<Individual> {
    if (!individual.individual) {
      individual.individual = this.afs.createId();
      individual.user = this.authService.getUserId();
    }

    if (individual.year === undefined) {
      individual.year = new Date().getFullYear();
    }

    return super.upsert(individual, individual.year + '_' + individual.individual);
  }

  listByYear(year: number): Observable<(Individual & IdLike)[]> {
    return (
      this.afs
        // TODO decide if year should be a number or a string
        .collection<Individual>(this.collectionName, ref => ref.where('year', '==', year.toString()))
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
        )
    );
  }
}
