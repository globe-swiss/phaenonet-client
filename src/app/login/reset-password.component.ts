import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { NavService } from '../core/nav/nav.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardSubtitle } from '@angular/material/card';
import { NgIf } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatCardSubtitle,
    TranslateModule
  ]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm = new FormGroup({
    email: new FormControl('')
  });

  resetPasswordEmailSent = false;

  constructor(
    private authService: AuthService,
    private navService: NavService
  ) {}

  ngOnInit(): void {
    this.navService.setLocation('Passwort zurücksetzen');
  }

  resetPassword(): void {
    this.authService.resetPassword(this.resetPasswordForm.controls.email.value).subscribe(_ => {
      this.resetPasswordEmailSent = true;
    });
  }
}
