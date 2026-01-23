import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AuthService } from '@core/services/auth.service';
import { TitleService } from '@core/services/title.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
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
    private titleService: TitleService
  ) {}

  ngOnInit(): void {
    this.titleService.setLocation('Passwort zurücksetzen');
  }

  resetPassword(): void {
    this.authService.resetPassword(this.resetPasswordForm.controls.email.value).subscribe(_ => {
      this.resetPasswordEmailSent = true;
    });
  }
}
