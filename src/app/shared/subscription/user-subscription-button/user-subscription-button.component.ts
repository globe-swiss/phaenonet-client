import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { Observable, ReplaySubject } from 'rxjs';
import { AlertService } from 'src/app/messaging/alert.service';
import { PublicUser } from 'src/app/open/public-user';
import { UserService } from 'src/app/profile/user.service';

@Component({
  selector: 'app-user-subscription-button',
  templateUrl: './user-subscription-button.component.html',
  styleUrls: ['./user-subscription-button.component.scss']
})
export class UserSubscriptionButtonComponent implements OnInit {
  @Input() user$: ReplaySubject<PublicUser>;
  isFollowing$: Observable<boolean>;

  constructor(
    private userService: UserService,
    private analytics: AngularFireAnalytics,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // //fixme: use userService provided method
    // this.isFollowing$ = this.authService.user$.pipe(
    //   filter(u => u !== null),
    //   map(u => (u.following_users ? u.following_users.find(id => id === this.userId) !== undefined : false))
    // );

    // this.isFollowing$ = this.user$.pipe(
    //   tap(x => console.log(x)),
    //   switchMap(u => this.userService.isFollowingUser(u.id)),
    //   tap(x => console.log(x))
    // );

    this.isFollowing$ = this.userService.isFollowingUser(this.user$);
  }

  follow(): void {
    // this.userService
    //   .followUser(this.userId)
    //   .pipe(first())
    //   .subscribe(_ => {
    //     this.alertService.infoMessage('Aktivitäten abonniert', 'Sie haben die Aktivitäten des Benutzers abonniert.');
    //   });

    // this.user$
    //   .pipe(switchMap(u => this.userService.followUser(u.id)))
    //   .subscribe(() =>
    //     this.alertService.infoMessage('Aktivitäten abonniert', 'Sie haben die Aktivitäten des Benutzers abonniert.')
    //   );

    this.userService
      .followUser(this.user$)
      .subscribe(() =>
        this.alertService.infoMessage('Aktivitäten abonniert', 'Sie haben die Aktivitäten des Benutzers abonniert.')
      );

    this.analytics.logEvent('follow-user');
  }

  unfollow(): void {
    // this.userService
    //   .unfollowUser(this.userId)
    //   .pipe(first())
    //   .subscribe(_ => {
    //     this.alertService.infoMessage(
    //       'Aktivitäten gekündigt',
    //       'Sie erhalten keine Aktivitäten mehr zu diesem Benutzer.'
    //     );
    //   });

    // this.user$
    //   .pipe(switchMap(u => this.userService.unfollowUser(u.id)))
    //   .subscribe(() =>
    //     this.alertService.infoMessage(
    //       'Aktivitäten gekündigt',
    //       'Sie erhalten keine Aktivitäten mehr zu diesem Benutzer.'
    //     )
    //   );

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
