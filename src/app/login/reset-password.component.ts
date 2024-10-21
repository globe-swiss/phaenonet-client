import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { NavService } from '../core/nav/nav.service';

@Component({
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
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
