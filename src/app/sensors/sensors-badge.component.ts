import { Component, Input } from '@angular/core';
import { SensorLiveData } from '../individual/individual';
import { NgIf, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-sensors-badge',
  templateUrl: './sensors-badge.component.html',
  styleUrls: ['./sensors-badge.component.scss'],
  standalone: true,
  imports: [NgIf, DecimalPipe]
})
export class SensorsBadgeComponent {
  @Input() sensorLiveData: SensorLiveData;
}
