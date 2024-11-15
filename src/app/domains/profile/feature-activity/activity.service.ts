import { Injectable } from '@angular/core';
import { Firestore, limit, orderBy, where } from '@angular/fire/firestore';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Activity } from './activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityService extends BaseResourceService<Activity> {
  constructor(
    protected afs: Firestore,
    protected fds: FirestoreDebugService
  ) {
    super(afs, 'activities', fds);
  }

  listByUser(userId: string, limitAmount: number = 8): Observable<Activity[]> {
    return this.queryCollection(
      where('followers', 'array-contains', userId),
      orderBy('activity_date', 'desc'),
      limit(limitAmount)
    ).pipe(tap(x => this.fds.addRead('activities (listByUser)', x.length)));
  }
}
