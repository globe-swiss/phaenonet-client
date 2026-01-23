import { CdkScrollable } from '@angular/cdk/scrolling';

import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

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
  templateUrl: './confirmation-dialog.component.html',
  imports: [
    MatButton,
    MatIcon,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    TranslateModule
  ]
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
