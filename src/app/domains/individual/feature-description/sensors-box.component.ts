import { DecimalPipe, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { SensorLiveData } from '@shared/models/individual.model';
import { IndividualService } from '@shared/services/individual.service';

@Component({
  selector: 'app-sensors-box',
  templateUrl: './sensors-box.component.html',
  styleUrls: ['./sensors-box.component.scss'],
  imports: [NgIf, MatTooltip, DecimalPipe, TranslateModule]
})
export class SensorsBoxComponent implements OnInit {
  @Input() sensorLiveData: SensorLiveData;
  lastMeasurementDateTime$: string;

  ngOnInit(): void {
    this.lastMeasurementDateTime$ = IndividualService.formatLastMeasurementDateTime(this.sensorLiveData);
  }
}
