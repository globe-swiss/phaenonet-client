import { Injectable } from '@angular/core';
import { limit, orderBy, where } from '@angular/fire/firestore';
import { BaseResourceService } from '@core/services/base-resource.service';
import { Observable } from 'rxjs';
import { Activity } from './activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityService extends BaseResourceService<Activity> {
  constructor() {
    super('activities');
  }

  listByUser(userId: string, limitAmount: number = 8): Observable<Activity[]> {
    return this.queryCollection(
      'ActivityService.listByUser',
      where('followers', 'array-contains', userId),
      orderBy('activity_date', 'desc'),
      limit(limitAmount)
    );
  }
}
