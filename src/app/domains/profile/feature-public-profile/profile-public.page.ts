import { AsyncPipe, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { AlertService, Level, UntranslatedAlertMessage } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { PublicUser } from '@shared/models/public-user.model';
import { PublicUserService } from '@shared/services/public-user.service';
import { CopyClipboardDirective } from '@shared/utils/copy-clipboard.directive';
import { none } from 'fp-ts/lib/Option';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserSubscriptionButtonComponent } from '../shared/user-subscription.widget';

@Component({
  selector: 'app-profile-public',
  templateUrl: './profile-public.page.html',
  styleUrls: ['./profile-public.page.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatIconButton,
    MatTooltip,
    MatIcon,
    CopyClipboardDirective,
    UserSubscriptionButtonComponent,
    AsyncPipe,
    TranslateModule
  ]
})
export class ProfilePublicComponent implements OnInit {
  @Input() userId: string;
  @Input() user$: ReplaySubject<PublicUser>;

  isLoggedIn: boolean;
  nickname$: Observable<string>;
  isRanger$: Observable<boolean>;

  constructor(
    protected authService: AuthService,
    protected alertService: AlertService,
    private publicUserService: PublicUserService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.authenticated();

    this.nickname$ = this.user$.pipe(map(u => u.nickname));
    this.isRanger$ = this.publicUserService.isRanger(this.user$);
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
}
