import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { equalValidation } from '../../../shared/validation';
import { ChangePasswordData } from './change-password-data';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
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
