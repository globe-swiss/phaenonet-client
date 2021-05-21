import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { none } from 'fp-ts/lib/Option';
import { Observable, ReplaySubject } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../../../messaging/alert.service';
import { PublicUser } from '../../../open/public-user';

@Component({
  selector: 'app-profile-public',
  templateUrl: './profile-public.component.html',
  styleUrls: ['./profile-public.component.scss']
})
export class ProfilePublicComponent implements OnInit {
  @Input() userId: string;
  @Input() user$: ReplaySubject<PublicUser>;

  isLoggedIn: boolean;
  nickname$: Observable<string>;

  constructor(
    protected authService: AuthService,
    protected alertService: AlertService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();

    this.nickname$ = this.user$.pipe(
      first(),
      map(u => u.nickname)
    );

    this.analytics.logEvent('profile.public.view');
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
}
