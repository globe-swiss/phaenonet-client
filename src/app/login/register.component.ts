import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user';
import { LanguageService } from '../core/language.service';
import { NavService } from '../core/nav/nav.service';
import { AlertService } from '../messaging/alert.service';
import { PublicUserService } from '../open/public-user.service';
import { equalValidation } from '../shared/validation';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm = new FormGroup({
    nickname: new FormControl('', { asyncValidators: this.publicUserService.uniqueNicknameValidator() }),
    firstname: new FormControl(''),
    lastname: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    passwordConfirm: new FormControl(''),
    locale: new FormControl('de-CH')
  });

  registerFailed = false;

  user: User;

  private subscription: Subscription;

  constructor(
    private authService: AuthService,
    private publicUserService: PublicUserService,
    private alertService: AlertService,
    private router: Router,
    private navService: NavService,
    private languageService: LanguageService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit(): void {
    this.navService.setLocation('Registrierung');
    const equalValidator = equalValidation('password', 'passwordConfirm', 'passwordMissmatch');
    this.registerForm.setValidators(equalValidator);
    this.registerForm.updateValueAndValidity();
    this.subscription = this.authService.getUserObservable().subscribe(user => {
      if (user) {
        this.user = user;
        this.alertService.infoMessage(
          'Registration erfolgreich',
          'Sie haben sich erfolgreich bei PhaenoNet registriert.'
        );
        this.analytics.logEvent('register.submit');
        this.router.navigateByUrl('/');
      }
    });
    if (this.showRegisterForm()) {
      this.analytics.logEvent('register.view');
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  register(): void {
    this.registerFailed = false;
    this.authService.register(
      this.registerForm.controls.email.value,
      this.registerForm.controls.password.value,
      this.registerForm.controls.nickname.value,
      this.registerForm.controls.firstname.value,
      this.registerForm.controls.lastname.value,
      this.registerForm.controls.locale.value
    );
  }

  showRegisterForm(): boolean {
    return !this.isLoggedIn() && !this.user;
  }

  isRegisterFailed(): boolean {
    return this.registerFailed;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  title(): string {
    if (this.isLoggedIn()) {
      return 'Willkommen';
    } else {
      return 'Jetzt registrieren!';
    }
  }

  changeLocale(event: MatSelectChange) {
    this.languageService.changeLocale(event.value);
  }
}
