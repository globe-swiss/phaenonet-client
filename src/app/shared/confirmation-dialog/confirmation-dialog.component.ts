import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgIf } from '@angular/common';
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
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    NgIf,
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
