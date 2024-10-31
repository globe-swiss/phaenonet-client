import { AsyncPipe, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ReplaySubject } from 'rxjs';
import { Individual } from '../individual';
import { IndividualHeaderGraphComponent } from './individual-header-graph.component';
import { IndividualHeaderMapComponent } from './individual-header-map.component';

export enum HeaderTypes {
  Map = 'Map',
  Temperature = 'Temperature',
  Humidity = 'Humidity'
}

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

  HeaderTypes = HeaderTypes;

  headerType = HeaderTypes.Map;

  ngOnInit(): void {
    this.edit = this.mode === 'edit';
  }
}
