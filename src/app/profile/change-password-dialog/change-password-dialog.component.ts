import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { equalValidation } from '../../shared/validation';
import { ChangePasswordData } from './change-password-data';

@Component({
  selector: 'change-password-dialog',
  templateUrl: 'change-password-dialog.component.html'
})
export class ChangePasswordDialogComponent implements OnInit {
  changePasswordForm = new FormGroup({
    currentPassword: new FormControl(''),
    password: new FormControl(''),
    passwordConfirm: new FormControl('')
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
