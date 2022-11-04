import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PublicUser } from 'src/app/open/public-user';
import { MasterdataService } from '../../masterdata/masterdata.service';
import { Phenophase } from '../../masterdata/phaenophase';
import { Species } from '../../masterdata/species';
import { PublicUserService } from '../../open/public-user.service';
import { formatShortDate, formatShortDateTime } from '../../shared/formatDate';
import { Individual, SensorLiveData } from '../individual';

@Component({
  selector: 'app-individual-description-header',
  templateUrl: './individual-description-header.component.html',
  styleUrls: ['./individual-description-header.component.scss']
})
export class IndividualDescriptionHeaderComponent implements OnInit {
  @Input() individual$: Observable<Individual>; // injected ReplaySubject

  species$: Observable<Species>;

  individualCreatorNickname$: Observable<string>;

  lastPhenophase$: Observable<Phenophase>;
  lastPhenophaseColor$: Observable<string>;
  lastObservationDate$: Observable<string>;

  private publicUser$: Observable<PublicUser>;
  isRanger$: Observable<boolean>;

  constructor(private masterdataService: MasterdataService, private publicUserService: PublicUserService) {}

  public lastMeasurement(sensor: SensorLiveData) {
    const asDate = new Date(sensor.ts.seconds * 1000);
    return formatShortDateTime(asDate);
  }

  ngOnInit(): void {
    this.publicUser$ = this.individual$.pipe(switchMap(i => this.publicUserService.get(i.user)));
    this.species$ = this.individual$.pipe(switchMap(i => this.masterdataService.getSpeciesValue(i.species)));

    this.individualCreatorNickname$ = this.publicUser$.pipe(map(u => u.nickname));

    const species$ = this.individual$.pipe(switchMap(i => this.masterdataService.getSpeciesValue(i.species)));
    this.lastPhenophase$ = combineLatest([this.individual$, species$]).pipe(
      switchMap(([i, s]) => this.masterdataService.getPhenophaseValue(s.id, i.last_phenophase))
    ); // unknown if non-existent
    this.lastPhenophaseColor$ = this.lastPhenophase$.pipe(map(p => this.masterdataService.getColor(p.id))); // only subscribed when lastPhenophase$ is present
    this.lastObservationDate$ = this.individual$.pipe(map(i => formatShortDate(i.last_observation_date.toDate()))); // only subscribed if individual has last_observation_date

    this.isRanger$ = this.publicUserService.isRanger(this.publicUser$);
  }
}
