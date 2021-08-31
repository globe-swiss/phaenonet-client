import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { Observable } from 'rxjs';
import { Individual } from 'src/app/individual/individual';
import { AuthService } from '../../../auth/auth.service';
import { AlertService } from '../../../messaging/alert.service';
import { UserService } from '../../../profile/user.service';

@Component({
  selector: 'app-individual-subscription-button',
  templateUrl: './individual-subscription-button.component.html',
  styleUrls: ['./individual-subscription-button.component.scss']
})
export class IndividualSubscriptionButtonComponent implements OnInit {
  @Input() individual$: Observable<Individual>;
  isFollowing$: Observable<boolean>;

  constructor(
    private userService: UserService,
    private analytics: AngularFireAnalytics,
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
    this.analytics.logEvent('unfollow-individual');
  }
}
