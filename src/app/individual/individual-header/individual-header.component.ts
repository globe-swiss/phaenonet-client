import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Individual } from '../individual';

const mapOrGraph = ['Map', 'Graph'] as const;
type MapOrGraph = typeof mapOrGraph[number];

@Component({
  selector: 'app-individual-header',
  templateUrl: './individual-header.component.html',
  styleUrls: ['./individual-header.component.scss']
})
export class IndividualHeaderComponent implements OnInit {
  @Input() individual$: ReplaySubject<Individual>;

  @Input() mode: 'edit' | 'detail';
  edit: boolean;

  mapOrGraph: MapOrGraph = 'Map';

  displayAirTemperature = true;
  displayAirHumidity = true;
  displaySoilTemperature = true;
  displaySoilHumidity = true;

  ngOnInit(): void {
    this.edit = this.mode === 'edit';

    const detailGeopos$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => i.geopos)
    );
  }
}
