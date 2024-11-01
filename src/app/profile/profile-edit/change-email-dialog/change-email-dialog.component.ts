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
import { ChangeEmailData } from './change-email-data';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

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
