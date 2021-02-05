import { Component, Input, OnInit } from '@angular/core';
import { Activity } from '../../../activity/activity';
import { formatShortDateTime } from '../../../core/formatDate';
import { MasterdataService } from '../../../masterdata/masterdata.service';

@Component({
  selector: 'app-activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss']
})
export class ActivityItemComponent implements OnInit {
  @Input() activity: Activity;
  formatShortDateTime = formatShortDateTime;

  constructor(private masterdataService: MasterdataService) {}

  ngOnInit() {}

  getIcon() {
    return this.masterdataService.getIndividualIconPath(
      this.activity.species,
      this.activity.source,
      this.activity.phenophase
    );
  }

  getDate() {
    return formatShortDateTime(this.activity.activity_date.toDate());
  }
}
