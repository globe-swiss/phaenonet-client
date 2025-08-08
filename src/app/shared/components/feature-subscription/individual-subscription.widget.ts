import { AsyncPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AlertService } from '@core/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { Individual } from '@shared/models/individual.model';
import { UserService } from '@shared/services/user.service';
import { Observable } from 'rxjs';
import { ButtonMode, SharedSubscriptionButtonComponent } from './shared-subscription.widget';

@Component({
  selector: 'app-individual-subscription-button',
  templateUrl: './shared-subscription.widget.html',
  styleUrls: ['./shared-subscription.widget.scss'],
  imports: [MatFabButton, MatButton, MatIcon, AsyncPipe, TranslateModule]
})
export class IndividualSubscriptionButtonComponent extends SharedSubscriptionButtonComponent implements OnInit {
  @Input() individual$: Observable<Individual>;
  @Input() mode: ButtonMode = 'FAB';
  isFollowing$: Observable<boolean>;

  constructor(
    private userService: UserService,
    private alertService: AlertService
  ) {
    super();
  }

  ngOnInit() {
    this.isFollowing$ = this.userService.isFollowingIndividual(this.individual$);
  }

  buttonMode(): ButtonMode {
    return this.mode;
  }

  follow(): void {
    this.userService
      .followIndividual(this.individual$)
      .subscribe(() =>
        this.alertService.infoMessage('Aktivitäten abonniert', 'Sie haben die Aktivitäten des Objekts abonniert.')
      );
  }

  unfollow(): void {
    this.userService
      .unfollowIndividual(this.individual$)
      .subscribe(() =>
        this.alertService.infoMessage('Aktivitäten gekündigt', 'Sie erhalten keine Aktivitäten mehr zu diesem Objekt.')
      );
  }
}
