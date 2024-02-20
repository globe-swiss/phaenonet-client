import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  registerForm: FormGroup<{
    nickname: FormControl<string>;
    firstname: FormControl<string>;
    lastname: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
    passwordConfirm: FormControl<string>;
    locale: FormControl<string>;
  }>;

  private subscription: Subscription;
  private realRegisterRequest: boolean;

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
    this.registerForm = new FormGroup({
      nickname: new FormControl('', {
        updateOn: 'blur',
        asyncValidators: this.publicUserService.uniqueNicknameValidator()
      }),
      firstname: new FormControl(''),
      lastname: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl(''),
      passwordConfirm: new FormControl(''),
      locale: new FormControl('de-CH')
    });

    const equalValidator = equalValidation('password', 'passwordConfirm', 'passwordMissmatch');
    this.registerForm.setValidators(equalValidator);
    this.registerForm.updateValueAndValidity();
    this.subscription = this.authService.user$.subscribe(user => {
      if (user) {
        if (this.realRegisterRequest) {
          this.alertService.infoMessage(
            'Registration erfolgreich',
            'Sie haben sich erfolgreich bei PhaenoNet registriert.'
          );
          void this.router.navigateByUrl('/');
        } else {
          void this.router.navigateByUrl('/profile');
        }
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      try {
        (this.nicknameField.nativeElement as HTMLInputElement).focus();
      } catch (error) {
        console.warn('Unable to set focus on nickname, already logged in?');
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  register(): void {
    this.realRegisterRequest = true;
    this.authService.register(
      this.registerForm.value.email,
      this.registerForm.value.password,
      this.registerForm.value.nickname,
      this.registerForm.value.firstname,
      this.registerForm.value.lastname,
      this.registerForm.value.locale
    );
  }

  showRegisterForm(): boolean {
    return !this.isLoggedIn();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  changeLocale(event: MatSelectChange): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.languageService.changeLocale(event.value);
  }
}
