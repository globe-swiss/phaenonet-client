import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Individual } from '../individual';

const mapOrGraph = ['Map', 'Temperature', 'Humidity'] as const;
type MapOrGraph = (typeof mapOrGraph)[number];

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

  ngOnInit(): void {
    this.edit = this.mode === 'edit';
  }
}
