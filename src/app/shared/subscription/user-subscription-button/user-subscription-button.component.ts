import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/messaging/alert.service';
import { PublicUserService } from 'src/app/open/public-user.service';
import { UserService } from 'src/app/profile/user.service';

@Component({
  selector: 'app-user-subscription-button',
  templateUrl: './user-subscription-button.component.html',
  styleUrls: ['./user-subscription-button.component.scss']
})
export class UserSubscriptionButtonComponent implements OnInit {
  @Input() userId: string;
  isFollowing$: Observable<boolean>;

  constructor(
    private userService: UserService,
    private publicUserService: PublicUserService,
    private analytics: AngularFireAnalytics,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.isFollowing$ = this.userService.isFollowingUser(this.userId);
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
