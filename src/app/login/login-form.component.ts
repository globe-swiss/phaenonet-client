import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { AlertService } from '../messaging/alert.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });

  loginFailed = false;

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onLoginSuccess: EventEmitter<void> = new EventEmitter<void>();

  constructor(private authService: AuthService, private alertService: AlertService) {}

  login(): void {
    this.loginFailed = false;
    this.authService
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,  @typescript-eslint/no-unsafe-call
      .login(this.loginForm.controls.email.value.trim(), this.loginForm.controls.password.value)
      .subscribe(user => {
        if (user) {
          this.onLoginSuccess.emit();
        }
      });
  }

  // fixme: this probably should redirect when logged in #125
  showLoginForm(): boolean {
    return !this.isLoggedIn(); // && !this.user;
  }

  isLoginFailed(): boolean {
    return this.loginFailed;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // fixme: set title static in page #125
  title(): string {
    if (this.isLoggedIn()) {
      return 'Willkommen';
    } else {
      return 'Bitte melden Sie sich an';
    }
  }
}
