import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';
import { IndividualPhenophase } from '../../../individual/individual-phenophase';
import { IndividualService } from '../../../individual/individual.service';

@Component({
  selector: 'app-observation-list',
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.scss']
})
export class ObservationListComponent implements OnInit, OnDestroy {
  @Input() userId: string;

  latestIndividualObservations$: Observable<IndividualPhenophase[]>;
  limitIndividuals$ = new BehaviorSubject<number>(4);

  constructor(
    private authService: AuthService,
    private individualService: IndividualService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit() {
    this.latestIndividualObservations$ = this.limitIndividuals$.pipe(
      switchMap(limit =>
        this.individualService.getIndividualPhenohases(this.individualService.listByUser(this.userId, limit))
      )
    );
  }

  isOwner(): boolean {
    return this.authService.getUserId() === this.userId;
  }

  showMoreIndividuals() {
    this.limitIndividuals$.next(1000);
    this.analytics.logEvent('profile.show-more-individuals');
  }

  ngOnDestroy() {
    this.limitIndividuals$.unsubscribe();
  }
}
