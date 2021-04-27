import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/messaging/alert.service';
import { PublicUser } from 'src/app/open/public-user';
import { PublicUserService } from 'src/app/open/public-user.service';
import { UserService } from 'src/app/profile/user.service';

@Component({
  selector: 'app-user-subscription-button',
  templateUrl: './user-subscription-button.component.html',
  styleUrls: ['./user-subscription-button.component.scss']
})
export class UserSubscriptionButtonComponent implements OnInit {
  @Input() user$: Observable<PublicUser>;
  @Input() userId: string;
  isFollowing$: Observable<boolean>;

  constructor(
    private userService: UserService,
    private publicUserService: PublicUserService,
    private analytics: AngularFireAnalytics,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    if (!this.user$) {
      this.user$ = this.publicUserService.get(this.userId);
    }
    this.isFollowing$ = this.userService.isFollowingUser(this.user$);
  }

  follow(): void {
    this.userService
      .followUser(this.user$)
      .subscribe(() =>
        this.alertService.infoMessage('Aktivitäten abonniert', 'Sie haben die Aktivitäten des Benutzers abonniert.')
      );

    this.analytics.logEvent('follow-user');
  }

  unfollow(): void {
    this.userService
      .unfollowUser(this.user$)
      .subscribe(() =>
        this.alertService.infoMessage(
          'Aktivitäten gekündigt',
          'Sie erhalten keine Aktivitäten mehr zu diesem Benutzer.'
        )
      );
    this.analytics.logEvent('unfollow-user');
  }
}
