import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { LanguageService } from '../core/language.service';
import { NavService } from '../core/nav/nav.service';
import { AlertService } from '../messaging/alert.service';
import { PublicUserService } from '../open/public-user.service';
import { equalValidation } from '../shared/validation';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('nickname') nicknameField!: ElementRef;
  registerForm: UntypedFormGroup;

  registerFailed = false;

  private subscription: Subscription;

  constructor(
    private authService: AuthService,
    private publicUserService: PublicUserService,
    private alertService: AlertService,
    private router: Router,
    private navService: NavService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.navService.setLocation('Registrierung');
    this.registerForm = new UntypedFormGroup({
      nickname: new UntypedFormControl('', {
        updateOn: 'blur',
        asyncValidators: this.publicUserService.uniqueNicknameValidator()
      }),
      firstname: new UntypedFormControl(''),
      lastname: new UntypedFormControl(''),
      email: new UntypedFormControl(''),
      password: new UntypedFormControl(''),
      passwordConfirm: new UntypedFormControl(''),
      locale: new UntypedFormControl('de-CH')
    });

    const equalValidator = equalValidation('password', 'passwordConfirm', 'passwordMissmatch');
    this.registerForm.setValidators(equalValidator);
    this.registerForm.updateValueAndValidity();
    this.subscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.alertService.infoMessage(
          'Registration erfolgreich',
          'Sie haben sich erfolgreich bei PhaenoNet registriert.'
        );
        void this.router.navigateByUrl('/');
      }
    });
  }

  ngAfterViewInit() {
    (this.nicknameField.nativeElement as HTMLInputElement).focus();
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

  // fixme: this probably should redirect to profile when logged in #125
  showRegisterForm(): boolean {
    return !this.isLoggedIn();
  }

  isRegisterFailed(): boolean {
    return this.registerFailed;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // fixme: this still needed? #125
  title(): string {
    if (this.isLoggedIn()) {
      return 'Willkommen';
    } else {
      return 'Jetzt registrieren!';
    }
  }

  changeLocale(event: MatSelectChange): void {
    this.languageService.changeLocale(event.value);
  }
}
