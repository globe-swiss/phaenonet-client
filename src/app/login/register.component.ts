import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { debounceTime, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user';
import { NavService } from '../core/nav/nav.service';
import { AlertService } from '../messaging/alert.service';
import { equalValidation } from '../shared/validation';
import { MatSelectChange } from '@angular/material';
import { LanguageService } from '../core/language.service';
import { PublicUserService } from '../open/public-user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit, AfterViewChecked {
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

  constructor(
    private authService: AuthService,
    private publicUserService: PublicUserService,
    private alertService: AlertService,
    private router: Router,
    private navService: NavService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    const equalValidator = equalValidation('password', 'passwordConfirm', 'passwordMissmatch');
    this.registerForm.setValidators(equalValidator);
    this.registerForm.updateValueAndValidity();
  }

  ngAfterViewChecked(): void {
    this.navService.setLocation('Registrierung');
  }

  register(): void {
    this.registerFailed = false;
    this.authService
      .register(
        this.registerForm.controls.email.value,
        this.registerForm.controls.password.value,
        this.registerForm.controls.nickname.value,
        this.registerForm.controls.firstname.value,
        this.registerForm.controls.lastname.value,
        this.registerForm.controls.locale.value
      )
      .subscribe(user => {
        if (user) {
          this.user = user;
          this.alertService.infoMessage(
            'Registration erfolgreich',
            'Sie haben sich erfolgreich bei PhaenoNet registriert.'
          );
          this.router.navigateByUrl('/');
        }
      });
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
      return 'Registrieren Sie sich für PhaenoNet';
    }
  }

  changeLocale(event: MatSelectChange) {
    this.languageService.changeLocale(event.value);
  }
}
