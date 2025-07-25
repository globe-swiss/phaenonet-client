import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatOption } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseDetailComponent } from '@core/components/base-detail.component';
import { TitleService } from '@core/services/title.service';
import { TranslateModule } from '@ngx-translate/core';
import { Individual } from '@shared/models/individual.model';
import { Comment, Phenophase, PhenophaseGroup } from '@shared/models/masterdata.model';
import { Observation } from '@shared/models/observation.model';
import { IndividualService } from '@shared/services/individual.service';
import { MasterdataService } from '@shared/services/masterdata.service';
import { combineLatest, Observable } from 'rxjs';
import { map, mergeAll, switchMap } from 'rxjs/operators';
import { IndividualHeaderComponent } from './feature-header/individual-header.component';
import { PhenophaseObservation, SpeciesPhenophaseObservations } from './shared/individual.model';
import { ObservationService } from './shared/observation.service';

@Component({
  templateUrl: './station.page.html',
  styleUrls: ['./station.page.scss'],
  imports: [
    NgIf,
    IndividualHeaderComponent,
    TranslateModule,
    MatSelect,
    NgFor,
    MatOption,
    MatFormField,
    MatInput,
    MatDatepickerInput,
    MatLabel,
    MatDatepicker,
    AsyncPipe
  ]
})
export class StationComponent extends BaseDetailComponent<Individual> implements OnInit {
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
    private titleService: TitleService,
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
    this.titleService.setLocation('Messstation');

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
        const observationsBySpecies = observations.reduce(
          (groups, observation) => {
            const key = `${observation.species},${observation.tree_id || ''}`;
            if (!groups[key]) {
              groups[key] = [];
            }
            groups[key].push(observation);
            return groups;
          },
          {} as Record<string, Observation[]>
        );

        return combineLatest(
          Object.entries(observationsBySpecies).map(([keys, os]) => {
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
                      observation: os.find((o: Observation) => o.phenophase === phenophase.id) ?? null
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
