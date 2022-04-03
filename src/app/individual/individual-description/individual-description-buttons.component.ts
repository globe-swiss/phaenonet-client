import { Component, Input } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { AlertService } from '../../messaging/alert.service';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { Individual } from '../individual';
import { IndividualService } from '../individual.service';

@Component({
  selector: 'app-individual-description-buttons',
  templateUrl: './individual-description-buttons.component.html',
  styleUrls: ['./individual-description-buttons.component.scss']
})
export class IndividualDescriptionButtonsComponent {
  @Input() individual$: Observable<Individual>; // injected ReplaySubject
  @Input() isEditable$: Observable<boolean>;
  @Input() individualId: string; // should be added to the individual by the resource service

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private individualService: IndividualService,
    private alertService: AlertService,
    private analytics: AngularFireAnalytics
  ) {}

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
      panelClass: 'phenonet-dialog-component',
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
      panelClass: 'phenonet-dialog-component',
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
