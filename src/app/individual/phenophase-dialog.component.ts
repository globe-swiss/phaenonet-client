import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Observation } from '../observation/observation';
import { PhenophaseObservation } from '../observation/phenophase-observation';

@Component({
  selector: 'app-phenohase-dialog',
  styleUrls: ['./phenophase-dialog.component.scss'],
  templateUrl: 'phenophase-dialog.component.html'
})
export class PhenophaseDialogComponent {
  showTouchCalendar$: Observable<boolean> = this.breakpointObserver
    .observe('(max-height: 700px)')
    .pipe(map(result => result.matches));

  originalDate: Observation['date'];
  originalComment: Observation['comment'];

  constructor(
    public dialogRef: MatDialogRef<PhenophaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PhenophaseObservation,
    private breakpointObserver: BreakpointObserver
  ) {
    const original = this.data.observation.getOrElse(null);
    if (original) {
      this.originalDate = original.date;
      this.originalComment = original.comment;
    }
  }

  close(): void {
    this.data.observation = this.data.observation.map(osb => {
      osb.date = this.originalDate;
      osb.comment = this.originalComment;
      return osb;
    });
    this.dialogRef.close(this.data);
  }

  deleteAndClose(): void {
    this.data.observation = this.data.observation.map(osb => {
      osb.date = null;
      osb.comment = null;
      return osb;
    });
    this.dialogRef.close();
  }
}
