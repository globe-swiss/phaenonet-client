import { CdkScrollable } from '@angular/cdk/scrolling';

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
import { ChangePasswordData } from './change-password.model';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
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
export class ChangePasswordDialogComponent implements OnInit {
  changePasswordForm = new UntypedFormGroup({
    currentPassword: new UntypedFormControl(''),
    password: new UntypedFormControl(''),
    passwordConfirm: new UntypedFormControl('')
  });

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangePasswordData
  ) {}

  ngOnInit(): void {
    const equalValidator = equalValidation('password', 'passwordConfirm', 'passwordMissmatch');
    this.changePasswordForm.setValidators(equalValidator);
    this.changePasswordForm.updateValueAndValidity();
  }

  close(): void {
    this.dialogRef.close();
  }
}
