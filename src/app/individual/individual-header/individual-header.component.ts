import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Individual } from '../individual';
import { NgIf, AsyncPipe } from '@angular/common';
import { IndividualHeaderMapComponent } from './individual-header-map.component';
import { IndividualHeaderGraphComponent } from './individual-header-graph.component';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

const mapOrGraph = ['Map', 'Temperature', 'Humidity'] as const;
type MapOrGraph = (typeof mapOrGraph)[number];

@Component({
  selector: 'app-individual-header',
  templateUrl: './individual-header.component.html',
  styleUrls: ['./individual-header.component.scss'],
  standalone: true,
  imports: [NgIf, IndividualHeaderMapComponent, IndividualHeaderGraphComponent, MatFabButton, MatIcon, AsyncPipe]
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
