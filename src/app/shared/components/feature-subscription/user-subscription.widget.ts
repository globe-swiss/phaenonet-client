import { AsyncPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AlertService } from '@core/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '@shared/services/user.service';
import { Observable } from 'rxjs';
import { ButtonMode, SharedSubscriptionButtonComponent } from './shared-subscription.widget';

@Component({
  selector: 'app-user-subscription-button',
  templateUrl: './shared-subscription.widget.html',
  styleUrls: ['./shared-subscription.widget.scss'],
  imports: [MatFabButton, MatIcon, MatButton, TranslateModule, AsyncPipe]
})
export class UserSubscriptionButtonComponent extends SharedSubscriptionButtonComponent implements OnInit {
  @Input() userId: string;
  @Input() nomargin = false;
  isFollowing$: Observable<boolean>;

  @Input()
  mode: ButtonMode = 'FAB';

  constructor(
    private userService: UserService,
    private alertService: AlertService
  ) {
    super();
  }

  ngOnInit(): void {
    this.isFollowing$ = this.userService.isFollowingUser(this.userId);
  }

  buttonMode(): ButtonMode {
    return this.mode;
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
