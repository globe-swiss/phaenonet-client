import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MasterdataService } from '@shared/services/masterdata.service';
import { formatShortDateTime } from '@shared/utils/formatDate';
import { Activity } from './activity.model';

@Component({
  selector: 'app-activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss'],
  imports: [RouterLink, TranslateModule]
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
