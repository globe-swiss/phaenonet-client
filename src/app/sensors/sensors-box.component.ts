import { Component, Input, OnInit } from '@angular/core';
import { SensorLiveData } from '../individual/individual';
import { IndividualService } from '../individual/individual.service';

@Component({
  selector: 'app-sensors-box',
  templateUrl: './sensors-box.component.html',
  styleUrls: ['./sensors-box.component.scss']
})
export class SensorsBoxComponent  implements OnInit {
  @Input() sensorLiveData: SensorLiveData;
  lastMeasurement$: string;
  lastMeasurementDateTime$: string;

  ngOnInit(): void {
    this.lastMeasurement$ = IndividualService.formatLastMeasurementDate(this.sensorLiveData);
    this.lastMeasurementDateTime$ = IndividualService.formatLastMeasurementDateTime(this.sensorLiveData);
  }
}
