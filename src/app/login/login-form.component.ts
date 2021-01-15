import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user';
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

  user: User;

  @Output()
  onLoginSuccess: EventEmitter<void> = new EventEmitter();

  constructor(private authService: AuthService, private alertService: AlertService) {}

  login(): void {
    this.loginFailed = false;
    this.authService
      .login(this.loginForm.controls.email.value.trim(), this.loginForm.controls.password.value)
      .subscribe(user => {
        if (user) {
          this.user = user;
          this.onLoginSuccess.emit();
        }
      });
  }

  showLoginForm(): boolean {
    return !this.isLoggedIn() && !this.user;
  }

  isLoginFailed(): boolean {
    return this.loginFailed;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  title(): string {
    if (this.isLoggedIn()) {
      return 'Willkommen';
    } else {
      return 'Bitte melden Sie sich an';
    }
  }
}
