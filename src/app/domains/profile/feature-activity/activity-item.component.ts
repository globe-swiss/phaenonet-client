import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MasterdataService } from '@masterdata/masterdata.service';
import { TranslateModule } from '@ngx-translate/core';
import { formatShortDateTime } from '@shared/utils/formatDate';
import { Activity } from './activity.model';

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
