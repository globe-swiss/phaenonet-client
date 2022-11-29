import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Activity } from '../../../activity/activity';
import { ActivityService } from '../../../activity/activity.service';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  @Input() userId: string;

  private limitActivities$ = new BehaviorSubject<number>(8);
  activities$: Observable<Activity[]>;

  constructor(private activityService: ActivityService) {}

  ngOnInit() {
    this.activities$ = this.limitActivities$.pipe(
      switchMap(limit => this.activityService.listByUser(this.userId, limit))
    );
  }

  /**
   * show 1000 for now
   */
  showAllActivities() {
    this.limitActivities$.next(1000);
  }
}
