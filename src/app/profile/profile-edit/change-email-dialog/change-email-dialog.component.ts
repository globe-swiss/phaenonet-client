import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';
import { equalValidation } from '../../../shared/validation';
import { ChangeEmailData } from './change-email-data';

@Component({
  selector: 'app-change-email-dialog',
  styleUrls: ['./change-email-dialog.component.scss'],
  templateUrl: './change-email-dialog.component.html'
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
