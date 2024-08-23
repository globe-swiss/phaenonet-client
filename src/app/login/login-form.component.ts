import { Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { AlertService } from '../messaging/alert.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { MatButton, MatAnchor } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
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
    NgIf,
    MatError,
    MatButton,
    MatCardFooter,
    MatAnchor,
    RouterLink,
    TranslateModule
  ]
})
export class LoginFormComponent {
  loginForm = new UntypedFormGroup({
    email: new UntypedFormControl(''),
    password: new UntypedFormControl('')
  });

  loginFailed = false;

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onLoginSuccess: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private alertService: AlertService
  ) {}

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

  isLoginFailed(): boolean {
    return this.loginFailed;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
