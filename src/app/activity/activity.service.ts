import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { Activity } from './activity';

@Injectable()
export class ActivityService extends BaseResourceService<Activity> {
  constructor(alertService: AlertService, protected afs: AngularFirestore) {
    super(alertService, afs, 'activities');
  }

  /**
   *
   * @param individuals ids with at most 10 entries because of firebase. TODO: check if combining all arrays is feasible.
   */
  listByIndividual(individuals: string[]): Observable<Activity[]> {
    return this.afs
      .collection<Activity>('activities', ref => ref.where('individual', 'in', individuals))
      .valueChanges();
  }

  insert(activity: Activity): Observable<Activity> {
    return this.upsert(activity, this.afs.createId());
  }
}
