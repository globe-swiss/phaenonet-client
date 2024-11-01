import { Component, Input } from '@angular/core';
import { Activity } from '../../../activity/activity';
import { MasterdataService } from '../../../masterdata/masterdata.service';
import { formatShortDateTime } from '../../../shared/formatDate';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss'],
  standalone: true,
  imports: [RouterLink, NgIf, TranslateModule]
})
export class ActivityItemComponent {
  @Input() activity: Activity;
  formatShortDateTime = formatShortDateTime;

  constructor(private masterdataService: MasterdataService) {}

  getIcon(): string {
    return this.masterdataService.getIndividualIconPath(
      this.activity.species,
      false,
      this.activity.source,
      this.activity.phenophase
    );
  }

  getDate(): string {
    return formatShortDateTime(this.activity.activity_date.toDate());
  }
}
