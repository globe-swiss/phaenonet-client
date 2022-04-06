import { Component, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { findFirst } from 'fp-ts/lib/Array';
import _ from 'lodash';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, map, mergeAll } from 'rxjs/operators';
import { BaseDetailComponent } from '../core/base-detail.component';
import { NavService } from '../core/nav/nav.service';
import { Individual } from '../individual/individual';
import { IndividualService } from '../individual/individual.service';
import { Comment } from '../masterdata/comment';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Phenophase } from '../masterdata/phaenophase';
import { PhenophaseGroup } from '../masterdata/phaenophase-group';
import { Observation } from '../observation/observation';
import { ObservationService } from '../observation/observation.service';
import { UserService } from '../profile/user.service';
import { PhenophaseObservation } from './phenophase-observation';
import { SpeciesPhenophaseObservations } from './species-phenophase-observations';

@Component({
  templateUrl: './station-detail.component.html',
  styleUrls: ['./station-detail.component.scss']
})
export class StationDetailComponent extends BaseDetailComponent<Individual> implements OnInit {
  availablePhenophases$: Observable<Phenophase[]>;
  availablePhenophaseGroups$: Observable<PhenophaseGroup[]>;
  availableComments$: Observable<Comment[]>;
  individualObservations$: Observable<Observation[]>;
  phenophaseObservationsBySpecies$: Observable<SpeciesPhenophaseObservations[]>;
  lastObservation: Observation;

  isFollowing$: Observable<boolean>;

  staticComments = {};

  constructor(
    private navService: NavService,
    protected route: ActivatedRoute,
    protected individualService: IndividualService,
    private observationService: ObservationService,
    private masterdataService: MasterdataService,
    public dialog: MatDialog,
    private analytics: AngularFireAnalytics,
    private userService: UserService,
    protected router: Router
  ) {
    super(individualService, route, router);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Messstation');

    this.isFollowing$ = this.userService.isFollowingIndividual(this.detailSubject$);

    this.detailSubject$
      .pipe(
        first(),
        filter(station => station !== undefined)
      )
      .subscribe(detail => {
        this.individualObservations$ = this.observationService.listByIndividual(this.detailId);
        this.availableComments$ = this.masterdataService.getComments();

        // combine the available phenophases with the existing observations
        this.phenophaseObservationsBySpecies$ = combineLatest([
          this.individualObservations$,
          this.availableComments$
        ]).pipe(
          map(([observations, comments]) => {
            comments.forEach(element => {
              this.staticComments[element.id] = element.de;
            });

            const observationsBySpecies = _.groupBy(observations, 'species');

            return combineLatest(
              _.map(observationsBySpecies, (os, speciesId) => {
                return combineLatest([
                  this.masterdataService.getSpeciesValue(speciesId),
                  this.masterdataService.getPhenophases(speciesId)
                ]).pipe(
                  map(([species, availablePhenophasesBySpecies]) => {
                    return {
                      species: species,
                      phenophaseObservations: availablePhenophasesBySpecies.map(phenophase => {
                        return {
                          phenophase: phenophase,
                          observation: findFirst((o: Observation) => o.phenophase === phenophase.id)(os)
                        } as PhenophaseObservation;
                      })
                    } as SpeciesPhenophaseObservations;
                  })
                );
              })
            );
          }),
          mergeAll()
        );

        void this.analytics.logEvent('station.view', {
          current: detail.year === this.masterdataService.getPhenoYear(),
          year: detail.year
        });
      });
  }
}
