import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { equalValidation } from '@shared/utils/validation';
import { ChangeEmailData } from './change-email.model';

@Component({
  selector: 'app-change-email-dialog',
  styleUrls: ['./change-email-dialog.component.scss'],
  templateUrl: './change-email-dialog.component.html',
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
    NgIf,
    MatDialogClose,
    TranslateModule
  ]
})
export class ChangeEmailDialogComponent implements OnInit {
  changeEmailForm = new UntypedFormGroup({
    email: new UntypedFormControl(''),
    emailConfirm: new UntypedFormControl(''),
    password: new UntypedFormControl('')
  });

  constructor(
    public dialogRef: MatDialogRef<ChangeEmailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangeEmailData
  ) {}

  ngOnInit(): void {
    const equalValidator = equalValidation('email', 'emailConfirm', 'emailMissmatch');
    this.changeEmailForm.setValidators(equalValidator);
    this.changeEmailForm.updateValueAndValidity();
  }

  close(): void {
    this.dialogRef.close();
  }
}
