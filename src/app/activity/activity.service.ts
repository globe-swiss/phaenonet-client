import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { FirestoreDebugService } from '../shared/firestore-debug.service';
import { Activity } from './activity';

@Injectable()
export class ActivityService extends BaseResourceService<Activity> {
  constructor(
    alertService: AlertService,
    protected afs: AngularFirestore,
    protected fds: FirestoreDebugService
  ) {
    super(alertService, afs, 'activities', fds);
  }

  listByUser(userId: string, limit: number = 8): Observable<Activity[]> {
    return this.afs
      .collection<Activity>('activities', ref =>
        ref.where('followers', 'array-contains', userId).orderBy('activity_date', 'desc').limit(limit)
      )
      .valueChanges()
      .pipe(tap(x => this.fds.addRead('activities (listByUser)', x.length)));
  }
}
