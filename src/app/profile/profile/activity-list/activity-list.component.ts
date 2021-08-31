import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Activity } from '../../../activity/activity';
import { ActivityService } from '../../../activity/activity.service';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit, OnDestroy {
  @Input() userId: string;

  limitActivities$ = new BehaviorSubject<number>(8);
  activities$: Observable<Activity[]>;

  constructor(private activityService: ActivityService, private analytics: AngularFireAnalytics) {}

  ngOnInit() {
    this.activities$ = this.limitActivities$.pipe(
      switchMap(limit => this.activityService.listByUser(this.userId, limit).pipe(take(1)))
    );
  }

  /**
   * show 1000 for now
   */
  showAllActivities() {
    this.limitActivities$.next(1000);
    this.analytics.logEvent('profile.show-more-activities');
  }

  ngOnDestroy() {
    this.limitActivities$.unsubscribe();
  }
}
