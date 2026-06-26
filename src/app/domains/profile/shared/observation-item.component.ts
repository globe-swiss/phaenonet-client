import { AsyncPipe } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IndividualPhenophase } from '@shared/models/individual-phenophase.model';
import { MasterdataService } from '@shared/services/masterdata.service';
import { formatShortDate } from '@shared/utils/formatDate';

@Component({
  selector: 'app-observation-item',
  templateUrl: './observation-item.component.html',
  styleUrls: ['./observation-item.component.scss'],
  imports: [RouterLink, MatIcon, AsyncPipe, TranslateModule]
})
export class ObservationItemComponent {
  private masterdataService = inject(MasterdataService);

  @Input() item: IndividualPhenophase;
  @Input() year: number;

  getColor(phenophase: string): string {
    return this.masterdataService.getColor(phenophase);
  }

  getLastObservationDate(): string {
    return formatShortDate(this.item.individual.last_observation_date.toDate());
  }
}
