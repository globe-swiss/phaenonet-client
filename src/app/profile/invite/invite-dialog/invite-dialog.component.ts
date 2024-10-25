import { Component, Inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogClose
} from '@angular/material/dialog';
import { InviteDialogData } from './invite-dialog-data';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite-dialog.component.html',
  styleUrls: ['./invite-dialog.component.scss'],
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatDialogClose,
    TranslateModule
  ]
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
