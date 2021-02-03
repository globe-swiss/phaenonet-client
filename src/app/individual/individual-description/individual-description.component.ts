import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { filter, first, map, mergeAll, shareReplay } from 'rxjs/operators';

import { formatShortDate } from '../../core/formatDate';
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
import { Individual } from '../individual';
import { IndividualService } from '../individual.service';

@Component({
  selector: 'app-individual-description',
  templateUrl: './individual-description.component.html',
  styleUrls: ['./individual-description.component.scss']
})
export class IndividualDescriptionComponent implements OnInit {
  @Input() individual$: ReplaySubject<Individual>;
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

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private masterdataService: MasterdataService,
    private publicUserService: PublicUserService,
    private individualService: IndividualService,
    private alertService: AlertService,
    private analytics: AngularFireAnalytics
  ) {}

  exclude_undefined() {
    return filter(i => i !== undefined);
  }

  ngOnInit() {
    this.species$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.masterdataService.getSpeciesValue(i.species)),
      mergeAll()
    );
    this.description$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.masterdataService.getDescriptionValue(i.description)),
      mergeAll()
    );
    this.exposition$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.masterdataService.getExpositionValue(i.exposition)),
      mergeAll()
    );
    this.shade$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.masterdataService.getShadeValue(i.shade)),
      mergeAll()
    );
    this.habitat$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.masterdataService.getHabitatValue(i.habitat)),
      mergeAll()
    );
    this.forest$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.masterdataService.getForestValue(i.forest)),
      mergeAll()
    );
    this.distance$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.masterdataService.getDistanceValue(i.less100)),
      mergeAll()
    );
    this.irrigation$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.masterdataService.getIrrigationValue(i.watering)),
      mergeAll()
    );

    this.individualCreatorNickname$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.getUserName(i)),
      mergeAll()
    );

    this.lastPhenophase$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.getPhenophase(i)),
      mergeAll()
    );
    this.lastPhenophaseColor$ = this.lastPhenophase$.pipe(map(p => this.masterdataService.getColor(p.id))); // cannot be undefined
    this.lastObservationDate$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => formatShortDate(i.last_observation_date.toDate()))
    );
  }

  private getUserName(individual: Individual) {
    return this.publicUserService.get(individual.user).pipe(
      filter(u => u !== undefined),
      map(u => u.nickname),
      shareReplay()
    );
  }

  private getPhenophase(individual: Individual) {
    return this.masterdataService.getSpeciesValue(individual.species).pipe(
      map(species => this.masterdataService.getPhenophaseValue(species.id, individual.last_phenophase)),
      mergeAll()
    );
  }

  deleteIndividual() {
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
        // tslint:disable-next-line: max-line-length
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
          this.individualService.deleteImages(individual);
          this.individualService
            .delete(this.individualId)
            .then(() => {
              this.analytics.logEvent('individual.delete');
              this.alertService.infoMessage('Löschen erfolgreich', 'Das Objekt wurde gelöscht.');
              this.router.navigate(['/profile']);
            })
            .catch(() => {
              this.alertService.infoMessage('Löschen fehlgeschlagen', 'Das Objekt konnte nicht gelöscht werden.');
            });
        }
      });
  }

  private deleteNotPossibleDialog() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '615px',
      data: {
        title: 'LÖSCHEN NICHT MÖGLICH',
        // tslint:disable-next-line: max-line-length
        content:
          'Das Objekt kann nicht gelöscht werden, weil im aktuellen Jahr Beobachtungen erfasst wurden. Löschen Sie zuerst die Beobachtungen, um das Objekt löschen zu können.<br /><br />Wenn Sie die Beobachtungen im aktuellen Jahr behalten wollen, löschen Sie das Objekt erst im kommenden Jahr.',
        yes: 'zurück zum Objekt',
        yesColor: 'accent'
      } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe();
  }
}
