import { DecimalPipe, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SensorLiveData } from '@shared/models/individual.model';

@Component({
  selector: 'app-sensors-badge',
  templateUrl: './sensors-badge.component.html',
  styleUrls: ['./sensors-badge.component.scss'],
  imports: [NgIf, DecimalPipe]
})
export class SensorsBadgeComponent {
  @Input() sensorLiveData: SensorLiveData;
}
