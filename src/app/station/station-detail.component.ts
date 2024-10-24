import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { findFirst } from 'fp-ts/lib/Array';
import _ from 'lodash';
import { combineLatest, Observable } from 'rxjs';
import { map, mergeAll, switchMap } from 'rxjs/operators';
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
  years$: Observable<{ year: number; composedId: string }[]>;
  id$: Observable<string>;

  isFollowing$: Observable<boolean>;

  staticComments = {};

  constructor(
    private navService: NavService,
    protected route: ActivatedRoute,
    public individualService: IndividualService,
    private observationService: ObservationService,
    private masterdataService: MasterdataService,
    public dialog: MatDialog,
    protected router: Router
  ) {
    super(individualService, route, router);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Messstation');

    this.id$ = this.route.paramMap.pipe(map(params => params.get('id')));

    this.individualObservations$ = this.id$.pipe(switchMap(id => this.observationService.listByIndividual(id)));
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

    this.years$ = this.detailSubject$.pipe(
      switchMap(individual => this.individualService.getSelectableIndividuals(individual.individual, false)),
      map(individuals =>
        individuals.map(i => {
          return {
            year: i.year,
            composedId: this.individualService.composedId(i)
          };
        })
      )
    );
  }

  async selectYear(event: MatSelectChange) {
    await this.router.navigate(['..', event.value as string], {
      relativeTo: this.route
    });
  }
}
