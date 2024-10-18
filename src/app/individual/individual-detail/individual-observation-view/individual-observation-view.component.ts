import { Component, Input, OnInit } from '@angular/core';
import { deleteField } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { findFirst } from 'fp-ts/lib/Array';
import { some } from 'fp-ts/lib/Option';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, map, mergeAll, switchMap } from 'rxjs/operators';
import { UserService } from 'src/app/profile/user.service';
import { altitudeLimits } from '../../../masterdata/altitude-limits';
import { IdLike } from '../../../masterdata/masterdata-like';
import { MasterdataService } from '../../../masterdata/masterdata.service';
import { Observation } from '../../../observation/observation';
import { ObservationService } from '../../../observation/observation.service';
import { PhenophaseObservation } from '../../../observation/phenophase-observation';
import { PhenophaseObservationsGroup } from '../../../observation/phenophase-observations-group';
import { Individual } from '../../individual';
import { IndividualService } from '../../individual.service';
import { PhenophaseDialogComponent } from '../../phenophase-dialog.component';

@Component({
  selector: 'app-individual-observation-view',
  templateUrl: './individual-observation-view.component.html',
  styleUrls: ['./individual-observation-view.component.scss']
})
export class ObservationViewComponent implements OnInit {
  @Input() individual$: Observable<Individual>;
  @Input() isEditable$: Observable<boolean>;
  @Input() isOwn$: Observable<boolean>;

  phenophaseObservationsGroups$: Observable<PhenophaseObservationsGroup[]>;
  staticComments = {};
  years$: Observable<{ year: number; composedId: string }[]>;

  constructor(
    private dialog: MatDialog,
    private observationService: ObservationService,
    private masterdataService: MasterdataService,
    private userService: UserService,
    public individualService: IndividualService,
    protected router: Router,
    protected route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const availablePhenophases$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.masterdataService.getPhenophases(i.species)),
      mergeAll()
    );
    const availablePhenophaseGroups$ = this.individual$.pipe(
      filter(i => i !== undefined),
      map(i => this.masterdataService.getPhenophaseGroups(i.species)),
      mergeAll()
    );
    const individualObservations$ = this.individual$.pipe(
      switchMap(individual => this.observationService.listByIndividual(this.individualService.composedId(individual)))
    );
    const availableComments$ = this.masterdataService.getComments();

    // combine the available phenophases with the existing observations
    this.phenophaseObservationsGroups$ = combineLatest([
      this.individual$,
      availablePhenophaseGroups$,
      availablePhenophases$,
      individualObservations$,
      availableComments$
    ]).pipe(
      filter(o => o[0] !== undefined),
      map(([individual, phenophaseGroups, phenophases, observations, comments]) => {
        comments.forEach(element => {
          this.staticComments[element.id] = element.de;
        });

        return phenophaseGroups.map(phenophaseGroup => {
          const phenophaseObservations = phenophases
            .filter(p => p.group_id === phenophaseGroup.id)
            .map(p => {
              return {
                phenophase: p,
                limits: altitudeLimits(
                  individual.altitude,
                  this.masterdataService.getLimits(individual.species, p.id),
                  this.masterdataService.getPhenoYear()
                ),
                observation: findFirst((o: Observation) => o.phenophase === p.id)(observations),
                availableComments: comments.filter(a => p.comments?.find(commentId => commentId === a.id))
              };
            });

          const hasObservations = phenophaseObservations.find(po => po.observation.isSome()) !== undefined;

          return {
            phenophaseGroup: phenophaseGroup,
            phenophaseObservations: phenophaseObservations,
            hasObservations: hasObservations
          };
        });
      })
    );
    this.years$ = combineLatest([this.individual$, this.isOwn$]).pipe(
      switchMap(([individual, isOwn]) => this.individualService.getSelectableIndividuals(individual.individual, isOwn)),
      map(individuals =>
        individuals.map(i => ({
          year: i.year,
          composedId: this.individualService.composedId(i)
        }))
      )
    );
  }

  editPhenophaseDate(phenophaseObservation: PhenophaseObservation): void {
    const dialogRef = this.dialog.open(PhenophaseDialogComponent, {
      width: '615px',
      panelClass: 'phenonet-dialog-component',
      data: {
        phenophase: phenophaseObservation.phenophase,
        limits: phenophaseObservation.limits,
        observation: some(phenophaseObservation.observation.getOrElse({} as Observation)),
        availableComments: phenophaseObservation.availableComments
      } as PhenophaseObservation
    });

    dialogRef.afterClosed().subscribe((result: PhenophaseObservation) => {
      // discard result if empty or no data was selected (fixme -> disable button in form)
      if (result && result.observation.toNullable().date) {
        combineLatest([this.individual$, this.userService.getSource()])
          .pipe(first())
          .subscribe(([detail, source]) => {
            result.observation.map(observation => {
              // fix undefined comment #28
              if (observation.comment === undefined) {
                observation.comment = deleteField();
              }
              // if this is a new observation the created date is not set
              if (!observation.created) {
                observation.individual = detail.individual;
                observation.individual_id = this.individualService.composedId(detail);
                observation.phenophase = result.phenophase.id;
                observation.species = detail.species;
                observation.year = detail.year;
                observation.user = detail.user;
                observation.source = source;
              }

              const observationId = [
                observation.individual,
                observation.year,
                observation.species,
                observation.phenophase
              ].join('_');

              this.observationService.upsert(observation, observationId);
            });
          });
      } else if (!result?.observation.toNullable().date) {
        // delete observation
        phenophaseObservation.observation.map(po => this.observationService.delete((<IdLike>(<unknown>po)).id));
      }
    });
  }

  async selectYear(event: MatSelectChange) {
    await this.router.navigate(['..', event.value as string], {
      relativeTo: this.route
    });
  }
}
