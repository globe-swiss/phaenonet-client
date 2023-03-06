import { Component, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';

export interface ConfirmationDialogData {
  title: string;
  content: string;
  yes: string;
  no?: string;
  yesColor?: 'primary' | 'warn' | 'accent';
  noColor?: 'primary' | 'warn' | 'accent';
}

@Component({
  selector: 'app-confirmation-dialog',
  styleUrls: ['./confirmation-dialog.component.scss'],
  templateUrl: './confirmation-dialog.component.html'
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
