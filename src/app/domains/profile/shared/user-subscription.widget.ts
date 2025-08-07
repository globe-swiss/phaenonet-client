import { AsyncPipe, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AlertService } from '@core/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '@shared/services/user.service';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-user-subscription-button',
  templateUrl: './user-subscription.widget.html',
  styleUrls: ['./user-subscription.widget.scss'],
  imports: [NgIf, MatFabButton, MatIcon, MatButton, TranslateModule, AsyncPipe]
})
export class UserSubscriptionButtonComponent implements OnInit {
  @Input() userId: string;
  isFollowing$: Observable<boolean>;

  @Input()
  mode: 'FAB' | 'BUTTON' = 'FAB';

  displaySubscribed$: Observable<boolean>;

  constructor(
    private userService: UserService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.isFollowing$ = this.userService.isFollowingUser(this.userId).pipe(shareReplay(1));
  }

  follow(): void {
    this.userService
      .followUser(this.userId)
      .subscribe(() =>
        this.alertService.infoMessage('Aktivitäten abonniert', 'Sie haben die Aktivitäten des Benutzers abonniert.')
      );
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
  }
}
