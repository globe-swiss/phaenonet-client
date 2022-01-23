import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, switchMap, tap } from 'rxjs/operators';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { AuthService } from '../../../auth/auth.service';
import { IndividualPhenophase } from '../../../individual/individual-phenophase';
import { IndividualService } from '../../../individual/individual.service';

@Component({
  selector: 'app-observation-list',
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.scss']
})
export class ObservationListComponent implements OnInit {
  @Input() userId: string;

  latestIndividualObservations$: Observable<IndividualPhenophase[]>;
  private fromYear$ = new BehaviorSubject<number>(9999);
  private initialYear = 0;

  constructor(
    private authService: AuthService,
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit(): void {
    this.masterdataService.phenoYear$
      .pipe(
        first(),
        tap(year => (this.initialYear = year))
      )
      .subscribe(year => this.fromYear$.next(year));
    this.latestIndividualObservations$ = this.fromYear$.pipe(
      switchMap(year =>
        this.individualService.getIndividualPhenohases(this.individualService.listByUser(this.userId, year))
      )
    );
  }

  isOwner(): boolean {
    return this.authService.getUserId() === this.userId;
  }

  /**
   * 1st click, show last year. 2nd click show all observations.
   */
  showMoreIndividuals(): void {
    this.fromYear$.next(this.initialYear - this.fromYear$.value >= 1 ? 0 : this.fromYear$.value - 1);
    void this.analytics.logEvent('profile.show-more-individuals');
  }
}
