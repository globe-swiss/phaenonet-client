import { AsyncPipe, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AlertService } from '@core/services/alert.service';
import { Individual } from '@shared/models/individual.model';
import { UserService } from '@shared/services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-individual-subscription-button',
  templateUrl: './individual-subscription.widget.html',
  styleUrls: ['./individual-subscription.widget.scss'],
  imports: [NgIf, MatFabButton, MatIcon, AsyncPipe]
})
export class IndividualSubscriptionButtonComponent implements OnInit {
  @Input() individual$: Observable<Individual>;
  isFollowing$: Observable<boolean>;

  constructor(
    private userService: UserService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.isFollowing$ = this.userService.isFollowingIndividual(this.individual$);
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
