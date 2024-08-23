import { Component, Input } from '@angular/core';
import { formatShortDate } from '../../../shared/formatDate';
import { IndividualPhenophase } from '../../../individual/individual-phenophase';
import { MasterdataService } from '../../../masterdata/masterdata.service';
import { RouterLink } from '@angular/router';
import { NgIf, NgStyle, AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-observation-item',
  templateUrl: './observation-item.component.html',
  styleUrls: ['./observation-item.component.scss'],
  standalone: true,
  imports: [RouterLink, NgIf, NgStyle, MatIcon, AsyncPipe, TranslateModule]
})
export class ObservationItemComponent {
  @Input() item: IndividualPhenophase;
  @Input() year: number;

  constructor(private masterdataService: MasterdataService) {}

  getColor(phenophase: string): string {
    return this.masterdataService.getColor(phenophase);
  }

  getLastObservationDate(): string {
    return formatShortDate(this.item.individual.last_observation_date.toDate());
  }
}
