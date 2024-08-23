import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { none } from 'fp-ts/lib/Option';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../../../messaging/alert.service';
import { PublicUser } from '../../../open/public-user';
import { UserService } from '../../user.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton, MatButton } from '@angular/material/button';
import { CopyClipboardDirective } from '../../../shared/copy-clipboard.directive';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    NgIf,
    MatIcon,
    MatTooltip,
    MatIconButton,
    CopyClipboardDirective,
    MatButton,
    RouterLink,
    AsyncPipe
  ]
})
export class ProfileDetailsComponent implements OnInit {
  @Input() userId: string;
  @Input() user$: ReplaySubject<PublicUser>;

  nickname$: Observable<string>;
  firstname$: Observable<string>;
  lastname$: Observable<string>;
  email: string;
  locale$: Observable<string>;
  isRanger$: Observable<boolean>;

  constructor(
    protected authService: AuthService,
    protected alertService: AlertService,
    private userService: UserService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit(): void {
    this.email = this.authService.getUserEmail();
    const user$ = this.authService.user$;
    this.nickname$ = user$.pipe(map(u => u.nickname));
    this.firstname$ = user$.pipe(map(u => u.firstname));
    this.lastname$ = user$.pipe(map(u => u.lastname));
    this.locale$ = user$.pipe(map(u => u.locale));
    this.isRanger$ = this.userService.isRanger();

    void this.analytics.logEvent('profile.details.view');
  }

  get profileLink(): string {
    return window.location.origin + '/profile/' + this.userId;
  }

  notifyCopied(): void {
    this.alertService.alertMessage({
      title: 'Profil-Link',
      message: 'Der Link zum Profil wurde in die Zwischenablage kopiert.',
      level: Level.INFO,
      messageParams: [],
      titleParams: Object,
      duration: none
    } as UntranslatedAlertMessage);
  }

  logout(): void {
    this.authService.logout();
  }
}
