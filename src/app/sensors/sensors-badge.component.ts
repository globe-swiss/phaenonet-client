import { Component, Input } from '@angular/core';
import { SensorLiveData } from '../individual/individual';

@Component({
  selector: 'app-sensors-badge',
  templateUrl: './sensors-badge.component.html',
  styleUrls: ['./sensors-badge.component.scss']
})
export class SensorsBadgeComponent {
  @Input() sensorLiveData: SensorLiveData;
}
