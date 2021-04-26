import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { first, map } from 'rxjs/operators';
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
  @Input() individual$: ReplaySubject<Individual>;
  isFollowing$: Observable<boolean>;

  constructor(private authService: AuthService, private userService: UserService, private alertService: AlertService) {}

  ngOnInit() {
    // fixme: use methods provided in user service
    const currentUser = this.authService.user$;
    this.isFollowing$ = combineLatest([currentUser, this.individual$]).pipe(
      map(([u, i]) =>
        u.following_individuals ? u.following_individuals.find(id => id === i.individual) !== undefined : false
      )
    );
  }

  follow(): void {
    this.individualToFollow().subscribe(f =>
      this.userService
        .followIndividual(f)
        .pipe(first())
        .subscribe(_ => {
          this.alertService.infoMessage('Aktivitäten abonniert', 'Sie haben die Aktivitäten des Objekts abonniert.');
        })
    );
  }

  unfollow(): void {
    this.individualToFollow().subscribe(f =>
      this.userService
        .unfollowIndividual(f)
        .pipe(first())
        .subscribe(_ => {
          this.alertService.infoMessage(
            'Aktivitäten gekündigt',
            'Sie erhalten keine Aktivitäten mehr zu diesem Objekt.'
          );
        })
    );
  }

  private individualToFollow(): Observable<string> {
    return this.individual$.pipe(
      first(),
      map(i => i.individual)
    );
  }
}
