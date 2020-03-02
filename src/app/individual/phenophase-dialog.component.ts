import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PhenophaseObservation } from '../observation/phenophase-observation';

@Component({
  selector: 'phenophase-dialog',
  templateUrl: 'phenophase-dialog.component.html'
})
export class PhenophaseDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PhenophaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PhenophaseObservation
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
