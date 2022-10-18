import { Component, Input, OnInit } from '@angular/core';
import { SensorLiveData } from '../individual/individual';
import { IndividualInfoWindowData } from '../map/map-info.service';

@Component({
  selector: 'app-sensors-badge',
  templateUrl: './sensors-badge.component.html',
  styleUrls: ['./sensors-badge.component.scss']
})
export class SensorsBadgeComponent {
  @Input() sensorLiveData: SensorLiveData;
}
