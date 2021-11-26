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
  selector: 'app-individual-description',
  templateUrl: './individual-description.component.html',
  styleUrls: ['./individual-description.component.scss']
})
export class IndividualDescriptionComponent implements OnInit {
  @Input() individual$: Observable<Individual>; // injected ReplaySubject
  @Input() isEditable$: Observable<boolean>;
  @Input() individualId: string; // should be added to the individual by the resource service

  species$: Observable<Species>;
  description$: Observable<Description>;
  exposition$: Observable<Exposition>;
  shade$: Observable<Shade>;
  habitat$: Observable<Habitat>;
  forest$: Observable<Forest>;
  distance$: Observable<Distance>;
  irrigation$: Observable<Irrigation>;

  individualCreatorNickname$: Observable<string>;

  lastPhenophase$: Observable<Phenophase>;
  lastPhenophaseColor$: Observable<string>;
  lastObservationDate$: Observable<string>;

  private publicUser$: Observable<PublicUser>;
  isRanger$: Observable<boolean>;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private masterdataService: MasterdataService,
    private publicUserService: PublicUserService,
    private individualService: IndividualService,
    private alertService: AlertService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit(): void {
    // this.individual$ = this.individual$.pipe(filter(i => i !== undefined)); // why was this necessary? is it?
    this.publicUser$ = this.individual$.pipe(switchMap(i => this.publicUserService.get(i.user)));
    this.species$ = this.individual$.pipe(switchMap(i => this.masterdataService.getSpeciesValue(i.species)));
    this.description$ = this.individual$.pipe(
      switchMap(i => this.masterdataService.getDescriptionValue(i.description))
    );
    this.exposition$ = this.individual$.pipe(switchMap(i => this.masterdataService.getExpositionValue(i.exposition)));
    this.shade$ = this.individual$.pipe(switchMap(i => this.masterdataService.getShadeValue(i.shade)));
    this.habitat$ = this.individual$.pipe(switchMap(i => this.masterdataService.getHabitatValue(i.habitat)));
    this.forest$ = this.individual$.pipe(switchMap(i => this.masterdataService.getForestValue(i.forest)));
    this.distance$ = this.individual$.pipe(switchMap(i => this.masterdataService.getDistanceValue(i.less100)));
    this.irrigation$ = this.individual$.pipe(switchMap(i => this.masterdataService.getIrrigationValue(i.watering)));

    this.individualCreatorNickname$ = this.publicUser$.pipe(map(u => u.nickname));

    const species$ = this.individual$.pipe(switchMap(i => this.masterdataService.getSpeciesValue(i.species)));
    this.lastPhenophase$ = combineLatest([this.individual$, species$]).pipe(
      switchMap(([i, s]) => this.masterdataService.getPhenophaseValue(s.id, i.last_phenophase))
    ); // unknown if non-existent
    this.lastPhenophaseColor$ = this.lastPhenophase$.pipe(map(p => this.masterdataService.getColor(p.id))); // only subscribed when lastPhenophase$ is present
    this.lastObservationDate$ = this.individual$.pipe(map(i => formatShortDate(i.last_observation_date.toDate()))); // only subscribed if individual has last_observation_date

    this.isRanger$ = this.publicUserService.isRanger(this.publicUser$);
  }

  deleteIndividual(): void {
    this.individualService
      .hasObservations(this.individualId)
      .pipe(first())
      .subscribe(hasObservations => {
        if (hasObservations) {
          this.deleteNotPossibleDialog();
        } else {
          this.confirmDeleteDialog();
        }
      });
  }

  private confirmDeleteDialog() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '615px',
      data: {
        title: 'OBJEKT LÖSCHEN',
        // eslint-disable-next-line max-len
        content:
          'Möchten Sie das Objekt definitiv löschen? In Zukunft können Sie keine Daten mehr zu diesem Objekt eingeben. Daten zu diesem Objekt aus vergangenen Jahren bleiben erhalten.',
        yes: 'Objekt löschen',
        no: 'Abbrechen',
        yesColor: 'warn'
      } as ConfirmationDialogData
    });

    combineLatest([dialogRef.afterClosed(), this.individual$])
      .pipe(first())
      .subscribe(([confirmed, individual]) => {
        if (confirmed) {
          void this.router.navigate(['/profile']).then(() => {
            this.individualService.deleteImages(individual);
            this.individualService
              .delete(this.individualId)
              .then(() => {
                void this.analytics.logEvent('individual.delete');
                this.alertService.infoMessage('Löschen erfolgreich', 'Das Objekt wurde gelöscht.');
              })
              .catch(() => {
                this.alertService.infoMessage('Löschen fehlgeschlagen', 'Das Objekt konnte nicht gelöscht werden.');
              });
          });
        }
      });
  }

  private deleteNotPossibleDialog() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '615px',
      data: {
        title: 'LÖSCHEN NICHT MÖGLICH',
        // eslint-disable-next-line max-len
        content:
          'Das Objekt kann nicht gelöscht werden, weil im aktuellen Jahr Beobachtungen erfasst wurden. Löschen Sie zuerst die Beobachtungen, um das Objekt löschen zu können.<br /><br />Wenn Sie die Beobachtungen im aktuellen Jahr behalten wollen, löschen Sie das Objekt erst im kommenden Jahr.',
        yes: 'zurück zum Objekt',
        yesColor: 'accent'
      } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe();
  }
}
