import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  constructor(
    public dialogRef: MatDialogRef<PhenophaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PhenophaseObservation,
    private breakpointObserver: BreakpointObserver
  ) {}

  close(): void {
    this.dialogRef.close();
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
