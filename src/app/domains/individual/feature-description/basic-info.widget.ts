import { AsyncPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Description } from '@masterdata/description.model';
import { Distance } from '@masterdata/distance.model';
import { Exposition } from '@masterdata/exposition.model';
import { Forest } from '@masterdata/forest.model';
import { Habitat } from '@masterdata/habitat.model';
import { Irrigation } from '@masterdata/irrigation.model';
import { MasterdataService } from '@masterdata/masterdata.service';
import { Shade } from '@masterdata/shade.model';
import { TranslateModule } from '@ngx-translate/core';
import { Individual } from '@shared/models/individual.model';
import { RoundPipe } from '@shared/utils/round.pipe';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-individual-description-basic-info',
  templateUrl: './individual-description-basic-info.component.html',
  styleUrls: ['./individual-description-basic-info.component.scss'],
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

  constructor(
    private masterdataService: MasterdataService // private publicUserService: PublicUserService,
  ) {}

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
