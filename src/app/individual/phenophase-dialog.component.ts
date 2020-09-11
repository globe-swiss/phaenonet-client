import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PhenophaseObservation } from '../observation/phenophase-observation';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'phenophase-dialog',
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
}
