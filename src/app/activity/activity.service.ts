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

  listByUser(userId: string, limit: number = 8): Observable<Activity[]> {
    return this.afs
      .collection<Activity>('activities', ref =>
        ref
          .where('followers', 'array-contains', userId)
          .orderBy('date', 'desc')
          .limit(limit)
      )
      .valueChanges();
  }

  insert(activity: Activity): Observable<Activity> {
    return this.upsert(activity, this.afs.createId());
  }
}
