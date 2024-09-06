import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  loginForm = new FormGroup({
    email: new FormControl<string>(''),
    password: new FormControl<string>('')
  });

  loginFailed = false;

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onLoginSuccess: EventEmitter<void> = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  login(): void {
    this.loginFailed = false;
    this.authService
      .login(this.loginForm.controls.email.value.trim(), this.loginForm.controls.password.value)
      .subscribe(success => {
        if (success) {
          this.onLoginSuccess.emit();
        }
      });
  }

  isLoginFailed(): boolean {
    return this.loginFailed;
  }

  authenticated(): boolean {
    return this.authService.authenticated();
  }
}
