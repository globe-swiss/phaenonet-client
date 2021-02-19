import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { none } from 'fp-ts/lib/Option';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../../../messaging/alert.service';
import { PublicUser } from '../../../open/public-user';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit {
  @Input() userId: string;
  @Input() user$: ReplaySubject<PublicUser>;

  nickname$: Observable<string>;
  firstname$: Observable<string>;
  lastname$: Observable<string>;
  email: string;
  locale$: Observable<string>;

  constructor(
    protected authService: AuthService,
    protected alertService: AlertService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit() {
    this.email = this.authService.getUserEmail();
    const user$ = this.authService.user$;
    this.nickname$ = user$.pipe(map(u => u.nickname));
    this.firstname$ = user$.pipe(map(u => u.firstname));
    this.lastname$ = user$.pipe(map(u => u.lastname));
    this.locale$ = user$.pipe(map(u => u.locale));

    this.analytics.logEvent('profile.details.view');
  }

  get profileLink() {
    return window.location.origin + '/profile/' + this.userId;
  }

  notifyCopied() {
    this.alertService.alertMessage({
      title: 'Profil-Link',
      message: 'Der Link zum Profil wurde in die Zwischenablage kopiert.',
      level: Level.INFO,
      messageParams: [],
      titleParams: Object,
      duration: none
    } as UntranslatedAlertMessage);
  }

  logout() {
    this.authService.logout();
  }
}
