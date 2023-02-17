import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';
import { InviteDialogData } from './invite-dialog-data';

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite-dialog.component.html',
  styleUrls: ['./invite-dialog.component.scss']
})
export class InviteDialogComponent {
  inviteForm = new UntypedFormGroup({
    email: new UntypedFormControl('')
  });

  constructor(
    private dialogRef: MatDialogRef<InviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InviteDialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
