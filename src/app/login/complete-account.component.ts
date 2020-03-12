import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { none } from 'fp-ts/lib/Option';
import { AuthService } from '../auth/auth.service';
import { NavService } from '../core/nav/nav.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';

@Component({
  templateUrl: './complete-account.component.html'
})
export class CompleteAccountComponent implements OnInit, AfterViewChecked {
  completeAccountForm = new FormGroup({
    nickname: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl('')
  });

  registerFailed = false;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router,
    private navService: NavService
  ) {}

  ngOnInit(): void {}

  ngAfterViewChecked(): void {
    this.navService.setLocation('Account Vervollständigen');
  }

  completeAccount(): void {
    this.registerFailed = false;
    this.authService
      .completeAccount(
        this.completeAccountForm.controls.nickname.value,
        this.completeAccountForm.controls.password.value,
        this.completeAccountForm.controls.email.value
      )
      .subscribe(_ => {
        this.displayInfo();
        // force a reload after that profile update
        this.router.navigateByUrl('/profile').then(_ => window.location.reload());
      });
  }

  private displayInfo() {
    this.alertService.alertMessage({
      title: 'Account migriert',
      message: 'Ihr Account wurde erfolgreich vervollständigt. Sie können sich in Zukunft mit Ihrer E-Mail anmelden.',
      level: Level.INFO,
      messageParams: {},
      titleParams: Object,
      duration: none
    } as UntranslatedAlertMessage);
  }
}
