import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AlertService } from 'src/app/messaging/alert.service';
import { UserService } from 'src/app/profile/user.service';

@Component({
  selector: 'app-user-subscription-button',
  templateUrl: './user-subscription-button.component.html',
  styleUrls: ['./user-subscription-button.component.scss']
})
export class UserSubscriptionButtonComponent implements OnInit {
  @Input() userId: string;
  isFollowing$: Observable<boolean>;

  @Input()
  mode: 'FAB' | 'BUTTON' = 'FAB';

  displayFabSubscribed$: Observable<boolean>;
  displayFabNotSubscribed$: Observable<boolean>;
  displayButtonSubscribed$: Observable<boolean>;
  displayButtonNotSubscribed$: Observable<boolean>;

  constructor(
    private userService: UserService,
    private analytics: AngularFireAnalytics,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.isFollowing$ = this.userService.isFollowingUser(this.userId).pipe(shareReplay(1));
    this.displayFabSubscribed$ = this.isFollowing$.pipe(map(following => following && this.mode === 'FAB'));
    this.displayFabNotSubscribed$ = this.isFollowing$.pipe(map(following => !following && this.mode === 'FAB'));
    this.displayButtonSubscribed$ = this.isFollowing$.pipe(map(following => following && this.mode === 'BUTTON'));
    this.displayButtonNotSubscribed$ = this.isFollowing$.pipe(map(following => !following && this.mode === 'BUTTON'));
  }

  follow(): void {
    this.userService
      .followUser(this.userId)
      .subscribe(() =>
        this.alertService.infoMessage('Aktivitäten abonniert', 'Sie haben die Aktivitäten des Benutzers abonniert.')
      );

    void this.analytics.logEvent('follow-user');
  }

  unfollow(): void {
    this.userService
      .unfollowUser(this.userId)
      .subscribe(() =>
        this.alertService.infoMessage(
          'Aktivitäten gekündigt',
          'Sie erhalten keine Aktivitäten mehr zu diesem Benutzer.'
        )
      );
    void this.analytics.logEvent('unfollow-user');
  }
}
