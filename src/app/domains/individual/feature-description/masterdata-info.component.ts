import { AsyncPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Individual } from '@shared/models/individual.model';
import { Description, Distance, Exposition, Forest, Habitat, Irrigation, Shade } from '@shared/models/masterdata.model';
import { MasterdataService } from '@shared/models/masterdata.service';
import { RoundPipe } from '@shared/utils/round.pipe';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-masterdata-info',
  templateUrl: './masterdata-info.component.html',
  styleUrls: ['./masterdata-info.component.scss'],
  standalone: true,
  imports: [TranslateModule, AsyncPipe, RoundPipe]
})
export class IndividualDescriptionBasicInfoComponent implements OnInit {
  @Input() individual$: Observable<Individual>; // injected ReplaySubject

  description$: Observable<Description>;
  exposition$: Observable<Exposition>;
  shade$: Observable<Shade>;
  habitat$: Observable<Habitat>;
  forest$: Observable<Forest>;
  distance$: Observable<Distance>;
  irrigation$: Observable<Irrigation>;

  constructor(private masterdataService: MasterdataService) {}

  ngOnInit(): void {
    this.description$ = this.individual$.pipe(
      switchMap(i => this.masterdataService.getDescriptionValue(i.description))
    );
    this.exposition$ = this.individual$.pipe(switchMap(i => this.masterdataService.getExpositionValue(i.exposition)));
    this.shade$ = this.individual$.pipe(switchMap(i => this.masterdataService.getShadeValue(i.shade)));
    this.habitat$ = this.individual$.pipe(switchMap(i => this.masterdataService.getHabitatValue(i.habitat)));
    this.forest$ = this.individual$.pipe(switchMap(i => this.masterdataService.getForestValue(i.forest)));
    this.distance$ = this.individual$.pipe(switchMap(i => this.masterdataService.getDistanceValue(i.less100)));
    this.irrigation$ = this.individual$.pipe(switchMap(i => this.masterdataService.getIrrigationValue(i.watering)));
  }
}
