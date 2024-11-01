import { AsyncPipe, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '@shared/components/confirmation-dialog.component';
import { Individual } from '@shared/models/individual.model';
import { AlertService } from '@shared/services/alert.service';
import { combineLatest, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { IndividualService } from '../shared/individual.service';

@Component({
  selector: 'app-individual-description-buttons',
  templateUrl: './individual-description-buttons.widget.html',
  styleUrls: ['./individual-description-buttons.widget.scss'],
  standalone: true,
  imports: [NgIf, MatButton, RouterLink, AsyncPipe, TranslateModule]
})
export class IndividualDescriptionButtonsComponent {
  @Input() individual$: Observable<Individual>; // injected ReplaySubject
  @Input() isEditable$: Observable<boolean>;
  @Input() individualId: string; // should be added to the individual by the resource service

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private individualService: IndividualService,
    private alertService: AlertService
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

        content:
          'Möchten Sie das Objekt definitiv löschen? In Zukunft können Sie keine Daten mehr zu diesem Objekt eingeben. Daten zu diesem Objekt aus vergangenen Jahren bleiben erhalten.',
        yes: 'Objekt löschen',
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

        content:
          'Das Objekt kann nicht gelöscht werden, weil im aktuellen Jahr Beobachtungen erfasst wurden. Löschen Sie zuerst die Beobachtungen, um das Objekt löschen zu können.<br /><br />Wenn Sie die Beobachtungen im aktuellen Jahr behalten wollen, löschen Sie das Objekt erst im kommenden Jahr.',
        yesColor: 'accent'
      } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe();
  }
}
