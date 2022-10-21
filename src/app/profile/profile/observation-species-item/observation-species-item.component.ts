import { Component, Input } from '@angular/core';
import { formatShortDate } from '../../../shared/formatDate';
import { IndividualPhenophase } from '../../../individual/individual-phenophase';
import { MasterdataService } from '../../../masterdata/masterdata.service';

@Component({
  selector: 'app-observation-species-item',
  templateUrl: './observation-species-item.component.html',
  styleUrls: ['./observation-species-item.component.scss']
})
export class ObservationSpeciesItemComponent {
  @Input() species: string;
  @Input() items: IndividualPhenophase[];
  @Input() userId: string;
  @Input() year: number;

  constructor(private masterdataService: MasterdataService) {}

  getColor(phenophase: string): string {
    return this.masterdataService.getColor(phenophase);
  }

  getLastActivity(): string | undefined {
    const lastActivities = this.items
      .filter(i => i.individual.last_observation_date)
      .map(i => i.individual.last_observation_date?.seconds);
    return lastActivities.length > 0 ? formatShortDate(new Date(Math.max(...lastActivities))) : undefined;
  }

  getIconPath(): string {
    return this.masterdataService.getIndividualIconPath(this.species);
  }

  getSpecies() {
    return this.items[0].species;
  }
}
