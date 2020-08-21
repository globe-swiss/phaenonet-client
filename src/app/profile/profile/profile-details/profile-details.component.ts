import { AngularFireAnalytics } from '@angular/fire/analytics';
import { UserService } from '../../../auth/user.service';
import { Component, OnInit } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { first, map } from 'rxjs/operators';
import { AlertService, Level, UntranslatedAlertMessage } from 'src/app/messaging/alert.service';
import { Input } from '@angular/core';
import { none } from 'fp-ts/lib/Option';
import { PublicUser } from 'src/app/open/public-user';

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
    private userService: UserService,
    private analytics: AngularFireAnalytics,
  ) {}

  ngOnInit() {
    this.email = this.authService.getUserEmail();
    const user$ = this.userService.get(this.userId).pipe(first());
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
