import { AsyncPipe, NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActivityItemComponent } from './activity-item.component';
import { Activity } from './activity.model';
import { ActivityService } from './activity.service';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss'],
  standalone: true,
  imports: [TranslateModule, NgFor, ActivityItemComponent, MatButton, AsyncPipe]
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
