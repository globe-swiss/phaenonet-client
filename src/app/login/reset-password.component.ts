import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { NavService } from '../core/nav/nav.service';

@Component({
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm = new UntypedFormGroup({
    email: new UntypedFormControl('')
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
