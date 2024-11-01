import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { NavService } from '@shared/components/nav.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
    MatButton,
    MatCardFooter,
    MatAnchor,
    RouterLink,
    TranslateModule
  ]
})
export class LoginComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private navService: NavService
  ) {}

  ngOnInit(): void {
    this.navService.setLocation('Anmeldung');
  }

  loginForm = new FormGroup({
    email: new FormControl<string>(''),
    password: new FormControl<string>('')
  });

  login(): void {
    this.authService
      .login(this.loginForm.controls.email.value.trim(), this.loginForm.controls.password.value)
      .subscribe(success => {
        if (success) {
          this.onLoginSuccess();
        }
      });
  }

  authenticated(): boolean {
    return this.authService.authenticated();
  }

  onLoginSuccess(): void {
    // add some delay to avoid login race condition on authGuard
    setTimeout(
      () => void this.router.navigate([this.authService.redirectUrl ? this.authService.redirectUrl : '/profile']),
      100
    );
  }
}
