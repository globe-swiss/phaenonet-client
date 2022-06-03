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
    protected router: Router
  ) {
    super(individualService, route, router);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Messstation');

    this.detailSubject$
      .pipe(
        first(),
        filter(station => station !== undefined)
      )
      .subscribe(detail => {
        void this.analytics.logEvent('station.view', {
          current: detail.year === this.masterdataService.getPhenoYear(),
          year: detail.year
        });
      });

    this.individualObservations$ = this.observationService.listByIndividual(this.detailId);
    this.availableComments$ = this.masterdataService.getComments();

    // combine the available phenophases with the existing observations
    this.phenophaseObservationsBySpecies$ = combineLatest([this.individualObservations$, this.availableComments$]).pipe(
      map(([observations, comments]) => {
        comments.forEach(element => {
          this.staticComments[element.id] = element.de;
        });

        // group by species and individual name
        const observationsBySpecies = _.groupBy(observations, o => [o.species, o.tree_id]);

        return combineLatest(
          _.map(observationsBySpecies, (os, keys) => {
            const [speciesId, treeId] = keys.split(','); // unpack species and individual name
            console.log(treeId);

            return combineLatest([
              this.masterdataService.getSpeciesValue(speciesId),
              this.masterdataService.getPhenophases(speciesId)
            ]).pipe(
              map(([species, availablePhenophasesBySpecies]) => {
                return {
                  treeId: treeId,
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
      mergeAll(),
      // natural sort by species and individual name - does not consider translations
      map(x =>
        x.sort((v1, v2) =>
          (v1.species.de + v1.treeId).localeCompare(v2.species.de + v2.treeId, undefined, {
            numeric: true,
            sensitivity: 'base'
          })
        )
      )
    );
  }
}
