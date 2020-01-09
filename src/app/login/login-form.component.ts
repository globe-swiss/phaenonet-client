import { Component, Output, EventEmitter, Input, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';
import { none } from 'fp-ts/lib/Option';
import { LoginResult } from '../auth/login-result';

export class LoginFormComponentResult {
  status: string;
  username: string;
  password: string;
}

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html'
})
export class LoginFormComponent {
  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  loginFailed = false;

  loginResult: LoginResult;
  loginFormComponentResult: LoginFormComponentResult;

  @Input()
  formTitle: string = 'Anmeldung erforderlich';

  @Output()
  onLoginSuccess: EventEmitter<void> = new EventEmitter();

  constructor(private authService: AuthService, private alertService: AlertService) {}

  updateLoginResult(newLoginResult: LoginResult) {
    this.loginResult = newLoginResult;
    switch (newLoginResult.status) {
      case 'LOGIN_OK': {
        this.onLoginSuccess.emit();
      }
    }
  }

  login(): void {
    this.loginFailed = false;
    this.authService
      .login(this.loginForm.controls.username.value, this.loginForm.controls.password.value)
      .subscribe(user => {
        if (user) {
          this.updateLoginResult(new LoginResult('LOGIN_OK', '', user));
        }
      });
  }

  title(): string {
    if (!this.loginResult) {
      return 'Willkommen';
    } else {
      switch (this.loginResult.status) {
        default: {
          return 'Willkommen';
        }
      }
    }
  }
  showLoginForm(): boolean {
    return !this.isLoggedIn() && !this.loginResult;
  }

  isLoginFailed(): boolean {
    return this.loginFailed;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
