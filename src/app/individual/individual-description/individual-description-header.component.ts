import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { PublicUser } from 'src/app/open/public-user';
import { Description } from '../../masterdata/description';
import { Distance } from '../../masterdata/distance';
import { Exposition } from '../../masterdata/exposition';
import { Forest } from '../../masterdata/forest';
import { Habitat } from '../../masterdata/habitat';
import { Irrigation } from '../../masterdata/irrigation';
import { MasterdataService } from '../../masterdata/masterdata.service';
import { Phenophase } from '../../masterdata/phaenophase';
import { Shade } from '../../masterdata/shade';
import { Species } from '../../masterdata/species';
import { AlertService } from '../../messaging/alert.service';
import { PublicUserService } from '../../open/public-user.service';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { formatShortDate } from '../../shared/formatDate';
import { Individual } from '../individual';
import { IndividualService } from '../individual.service';

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
