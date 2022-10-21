import { Component, Input } from '@angular/core';
import { formatShortDate } from '../../../shared/formatDate';
import { IndividualPhenophase } from '../../../individual/individual-phenophase';
import { MasterdataService } from '../../../masterdata/masterdata.service';

@Component({
  selector: 'app-observation-item',
  templateUrl: './observation-item.component.html',
  styleUrls: ['./observation-item.component.scss']
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
