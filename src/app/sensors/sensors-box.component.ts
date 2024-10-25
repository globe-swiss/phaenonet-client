import { Component, Input, OnInit } from '@angular/core';
import { SensorLiveData } from '../individual/individual';
import { IndividualService } from '../individual/individual.service';
import { NgIf, DecimalPipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sensors-box',
  templateUrl: './sensors-box.component.html',
  styleUrls: ['./sensors-box.component.scss'],
  standalone: true,
  imports: [NgIf, MatTooltip, DecimalPipe, TranslateModule]
})
export class SensorsBoxComponent implements OnInit {
  @Input() sensorLiveData: SensorLiveData;
  lastMeasurementDateTime$: string;

  ngOnInit(): void {
    this.lastMeasurementDateTime$ = IndividualService.formatLastMeasurementDateTime(this.sensorLiveData);
  }
}
