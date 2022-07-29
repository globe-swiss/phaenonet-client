import { Component, Input } from '@angular/core';
import { Activity } from '../../../activity/activity';
import { MasterdataService } from '../../../masterdata/masterdata.service';
import { formatShortDateTime } from '../../../shared/formatDate';

@Component({
  selector: 'app-activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss']
})
export class ActivityItemComponent {
  @Input() activity: Activity;
  formatShortDateTime = formatShortDateTime;

  constructor(private masterdataService: MasterdataService) {}

  getIcon(): string {
    return this.masterdataService.getIndividualIconPath(
      this.activity.species,
      this.activity.source,
      this.activity.phenophase
    );
  }

  getDate(): string {
    return formatShortDateTime(this.activity.activity_date.toDate());
  }
}
