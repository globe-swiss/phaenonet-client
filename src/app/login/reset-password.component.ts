import { AngularFireAnalytics } from '@angular/fire/analytics';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NavService } from '../core/nav/nav.service';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm = new FormGroup({
    email: new FormControl('')
  });

  resetPasswordEmailSent = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private navService: NavService,
    private analytics: AngularFireAnalytics,
  ) {}

  ngOnInit(): void {
    this.navService.setLocation('Passwort zurücksetzen');
  }

  resetPassword(): void {
    this.authService.resetPassword(this.resetPasswordForm.controls.email.value).subscribe(_ => {
      this.resetPasswordEmailSent = true;
      this.analytics.logEvent('passwordreset.submit');
    });
  }
}
