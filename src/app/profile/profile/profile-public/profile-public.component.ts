import { Component, Input, OnInit } from '@angular/core';
import { none } from 'fp-ts/lib/Option';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PublicUserService } from 'src/app/open/public-user.service';
import { AuthService } from '../../../auth/auth.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../../../messaging/alert.service';
import { PublicUser } from '../../../open/public-user';
import { NgIf, AsyncPipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { CopyClipboardDirective } from '../../../shared/copy-clipboard.directive';
import { UserSubscriptionButtonComponent } from '../../../shared/subscription/user-subscription-button/user-subscription-button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-public',
  templateUrl: './profile-public.component.html',
  styleUrls: ['./profile-public.component.scss'],
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
