import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { none } from 'fp-ts/lib/Option';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../../../messaging/alert.service';
import { PublicUser } from '../../../open/public-user';
import { UserService } from '../../../profile/user.service';

@Component({
  selector: 'app-profile-public',
  templateUrl: './profile-public.component.html',
  styleUrls: ['./profile-public.component.scss']
})
export class ProfilePublicComponent implements OnInit {
  @Input() userId: string;
  @Input() user$: ReplaySubject<PublicUser>;

  isLoggedIn: boolean;
  isFollowing$: Observable<boolean>;
  nickname$: Observable<string>;

  constructor(
    protected authService: AuthService,
    protected alertService: AlertService,
    private userService: UserService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();

    this.nickname$ = this.user$.pipe(
      first(),
      map(u => u.nickname)
    );

    this.isFollowing$ = this.authService.user$.pipe(
      filter(u => u !== null),
      map(u => (u.following_users ? u.following_users.find(id => id === this.userId) !== undefined : false))
    );
    this.analytics.logEvent('profile.public.view');
  }

  follow(): void {
    this.userService
      .followUser(this.userId)
      .pipe(first())
      .subscribe(_ => {
        this.alertService.infoMessage('Aktivitäten abonniert', 'Sie haben die Aktivitäten des Benutzers abonniert.');
      });

    this.analytics.logEvent('follow-user');
  }

  unfollow(): void {
    this.userService
      .unfollowUser(this.userId)
      .pipe(first())
      .subscribe(_ => {
        this.alertService.infoMessage(
          'Aktivitäten gekündigt',
          'Sie erhalten keine Aktivitäten mehr zu diesem Benutzer.'
        );
      });

    this.analytics.logEvent('unfollow-user');
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
