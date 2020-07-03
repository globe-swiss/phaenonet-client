import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';
import { UserService } from '../../../auth/user.service';
import { AlertService } from '../../../messaging/alert.service';
import { Individual } from '../../individual';

@Component({
  selector: 'app-individual-subscription',
  templateUrl: './individual-subscription.component.html',
  styleUrls: ['./individual-subscription.component.scss']
})
export class SubscriptionBarComponent implements OnInit {
  @Input() individual: ReplaySubject<Individual>;
  isFollowing: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertService: AlertService
    ) { }

  ngOnInit() {
    const currentUser = this.authService.getUserObservable();
    this.isFollowing = combineLatest([currentUser, this.individual]).pipe(
      map(([u, i]) => u.following_individuals
                          ? u.following_individuals.find(id => id === i.individual) !== undefined
                          : false
      )
    );
  }

  follow(): void {
    this.individualToFollow().subscribe(f =>
      this.userService
        .followIndividual(f)
        .pipe(first())
        .subscribe(_ => {
          this.alertService.infoMessage(
            'Aktivitäten abonniert',
            'Sie haben die Aktivitäten des Objekts abonniert.');
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
    return this.individual.pipe(
      first(),
      map(i => i.individual)
    );
  }
}
