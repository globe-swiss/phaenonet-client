import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MasterdataService } from '@shared/services/masterdata.service';
import { formatShortDateTime } from '@shared/utils/formatDate';
import { Activity } from './activity.model';

@Component({
  selector: 'app-activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss'],
  imports: [RouterLink, TranslatePipe]
})
export class ActivityItemComponent {
  private masterdataService = inject(MasterdataService);

  @Input() activity: Activity;
  formatShortDateTime = formatShortDateTime;

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
