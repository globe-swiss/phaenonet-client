import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { first, map, mergeAll } from 'rxjs/operators';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';

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
    private masterdataService: MasterdataService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit() {
    // combine the list of individuals with their phenophase
    this.latestIndividualObservations$ = combineLatest(
      [this.limitIndividuals$, this.individualService.listByUser(this.userId)],
      (limit, individuals) =>
        combineLatest(
          individuals
            .sort((l, r) => {
              const l_hasnt_last_obs = l.last_observation_date ? false : true;
              const r_hasnt_last_obs = r.last_observation_date ? false : true;

              if (l_hasnt_last_obs && r_hasnt_last_obs) {
                return 0;
              }
              if (l_hasnt_last_obs) {
                return -1;
              }
              if (r_hasnt_last_obs) {
                return 1;
              } else {
                return (r.last_observation_date as any).toMillis() - (l.last_observation_date as any).toMillis();
              }
            })
            .slice(0, limit)
            .map(individual => {
              return combineLatest(
                this.masterdataService.getSpeciesValue(individual.species),
                this.masterdataService.getPhenophaseValue(individual.species, individual.last_phenophase),
                (species, phenophase) => {
                  return {
                    individual: individual,
                    species: species,
                    lastPhenophase: phenophase,
                    imgUrl$: this.individualService.getImageUrl(individual, true).pipe(
                      first(),
                      map(u => (u === null ? 'assets/img/pic_placeholder.svg' : u))
                    )
                  } as IndividualPhenophase;
                }
              );
            })
        )
    ).pipe(mergeAll());
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
