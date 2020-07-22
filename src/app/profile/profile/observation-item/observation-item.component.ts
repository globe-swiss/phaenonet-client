import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { formatShortDate } from 'src/app/core/formatDate';
import { Component, OnInit, Input } from '@angular/core';
import { IndividualPhenophase } from '../../../individual/individual-phenophase';

@Component({
  selector: 'app-observation-item',
  templateUrl: './observation-item.component.html',
  styleUrls: ['./observation-item.component.scss']
})
export class ObservationItemComponent implements OnInit {

  @Input() item: IndividualPhenophase;

  constructor(
    private masterdataService: MasterdataService
  ) { }

  ngOnInit() {
  }

  getColor(phenophase: string) {
    return this.masterdataService.getColor(phenophase);
  }

  getLastObservationDate() {
    return formatShortDate(this.item.individual.last_observation_date.toDate());
  }

}
