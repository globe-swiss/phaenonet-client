import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NavService } from '../core/nav/nav.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
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

  loginFailed = false;

  login(): void {
    this.loginFailed = false;
    this.authService
      .login(this.loginForm.controls.email.value.trim(), this.loginForm.controls.password.value)
      .subscribe(success => {
        console.log('login', success);

        if (success) {
          this.onLoginSuccess();
        }
      });
  }

  isLoginFailed(): boolean {
    return this.loginFailed;
  }

  authenticated(): boolean {
    return this.authService.authenticated();
  }

  onLoginSuccess(): void {
    void this.router.navigate([this.authService.redirectUrl ? this.authService.redirectUrl : '/profile']);
  }
}
