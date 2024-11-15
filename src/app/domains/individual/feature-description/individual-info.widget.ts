import { AsyncPipe, NgIf, NgStyle } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Individual } from '@shared/models/individual.model';
import { Phenophase, Species } from '@shared/models/masterdata.model';
import { MasterdataService } from '@shared/services/masterdata.service';
import { PublicUserService } from '@shared/services/public-user.service';
import { ShortdatePipe } from '@shared/utils/shortdate.pipe';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { IndividualService } from '../../../shared/services/individual.service';
import { SensorsBoxComponent } from './sensors-box.component';

@Component({
  selector: 'app-individual-info',
  templateUrl: './individual-info.widget.html',
  styleUrls: ['./individual-info.widget.scss'],
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    NgStyle,
    RouterLink,
    MatIconButton,
    MatTooltip,
    MatIcon,
    SensorsBoxComponent,
    AsyncPipe,
    ShortdatePipe
  ]
})
export class IndividualDescriptionHeaderComponent implements OnInit {
  @Input() individual$: Observable<Individual>; // injected ReplaySubject

  species$: Observable<Species>;

  individualCreatorNickname$: Observable<string>;
  lastMeasurement$: Observable<string>;

  lastPhenophase$: Observable<Phenophase>;
  lastPhenophaseColor$: Observable<string>;

  isRanger$: Observable<boolean>;

  constructor(
    private masterdataService: MasterdataService,
    private publicUserService: PublicUserService
  ) {}

  ngOnInit(): void {
    const publicUser$ = this.individual$.pipe(switchMap(i => this.publicUserService.get(i.user)));
    this.species$ = this.individual$.pipe(switchMap(i => this.masterdataService.getSpeciesValue(i.species)));

    this.individualCreatorNickname$ = publicUser$.pipe(map(u => u.nickname));
    this.lastMeasurement$ = this.individual$.pipe(map(i => IndividualService.formatLastMeasurementDateTime(i.sensor)));

    const species$ = this.individual$.pipe(switchMap(i => this.masterdataService.getSpeciesValue(i.species)));
    this.lastPhenophase$ = combineLatest([this.individual$, species$]).pipe(
      switchMap(([i, s]) => this.masterdataService.getPhenophaseValue(s.id, i.last_phenophase))
    ); // undefined if non-existent
    // filter: lastPhenophase will be undefined when navigating to an individual without observation in the dropdown selection
    this.lastPhenophaseColor$ = this.lastPhenophase$.pipe(
      filter(p => p !== undefined),
      map(p => this.masterdataService.getColor(p.id))
    );

    this.isRanger$ = this.publicUserService.isRanger(publicUser$);
  }
}
