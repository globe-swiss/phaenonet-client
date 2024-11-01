import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AuthService } from '@core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { NavService } from '@shared/components/nav.service';

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
