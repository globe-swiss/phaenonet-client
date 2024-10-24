import { Component, Input, OnInit, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { none } from 'fp-ts/lib/Option';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LOGGED_OUT_URL } from 'src/app/app-routing.module';
import { AuthService } from '../../../auth/auth.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../../../messaging/alert.service';
import { PublicUser } from '../../../open/public-user';
import { UserService } from '../../user.service';

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
  email: Signal<string>;
  locale$: Observable<string>;
  isRanger$: Observable<boolean>;

  constructor(
    protected authService: AuthService,
    protected alertService: AlertService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.email = this.authService.email;
    const user$ = this.userService.user$;
    this.nickname$ = user$.pipe(map(u => u.nickname));
    this.firstname$ = user$.pipe(map(u => u.firstname));
    this.lastname$ = user$.pipe(map(u => u.lastname));
    this.locale$ = user$.pipe(map(u => u.locale));
    this.isRanger$ = this.userService.isRanger();
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
    void this.router.navigate([LOGGED_OUT_URL]);
  }
}
