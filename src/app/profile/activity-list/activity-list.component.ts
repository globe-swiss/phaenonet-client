import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ActivityService } from '../../activity/activity.service';
import { Activity } from '../../activity/activity';
import { switchMap, take } from 'rxjs/operators';
import { AngularFireAnalytics } from '@angular/fire/analytics';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit, OnDestroy {
  @Input() userId: string;

  limitActivities = new BehaviorSubject<number>(8);
  activities: Observable<Activity[]>;

  constructor(
    private activityService: ActivityService,
    private analytics: AngularFireAnalytics,
    ) { }

  ngOnInit() {
    this.activities = this.limitActivities.pipe(
      switchMap(limit => this.activityService.listByUser(this.userId, limit).pipe(take(1)))
    );
  }

   /**
   * show 1000 for now
   */
  showAllActivities() {
    this.limitActivities.next(1000);
    this.analytics.logEvent('profile.show-more-activities');
  }

  ngOnDestroy() {
    this.limitActivities.unsubscribe();
  }

}
