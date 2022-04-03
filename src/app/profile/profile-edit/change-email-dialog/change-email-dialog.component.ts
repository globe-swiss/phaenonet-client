import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { equalValidation } from '../../../shared/validation';
import { ChangeEmailData } from './change-email-data';

@Component({
  selector: 'app-change-email-dialog',
  styleUrls: ['./change-email-dialog.component.scss'],
  templateUrl: './change-email-dialog.component.html'
})
export class ChangeEmailDialogComponent implements OnInit {
  changeEmailForm = new FormGroup({
    email: new FormControl(''),
    emailConfirm: new FormControl(''),
    password: new FormControl('')
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
