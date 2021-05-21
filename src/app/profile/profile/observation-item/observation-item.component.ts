import { Component, Input, OnInit } from '@angular/core';
import { formatShortDate } from '../../../shared/formatDate';
import { IndividualPhenophase } from '../../../individual/individual-phenophase';
import { MasterdataService } from '../../../masterdata/masterdata.service';

@Component({
  selector: 'app-observation-item',
  templateUrl: './observation-item.component.html',
  styleUrls: ['./observation-item.component.scss']
})
export class ObservationItemComponent implements OnInit {
  @Input() item: IndividualPhenophase;

  constructor(private masterdataService: MasterdataService) {}

  ngOnInit() {}

  getColor(phenophase: string) {
    return this.masterdataService.getColor(phenophase);
  }

  getLastObservationDate() {
    return formatShortDate(this.item.individual.last_observation_date.toDate());
  }
}
