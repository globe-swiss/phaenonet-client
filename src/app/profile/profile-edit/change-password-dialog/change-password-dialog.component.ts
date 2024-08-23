import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogClose
} from '@angular/material/dialog';
import { equalValidation } from '../../../shared/validation';
import { ChangePasswordData } from './change-password-data';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
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
