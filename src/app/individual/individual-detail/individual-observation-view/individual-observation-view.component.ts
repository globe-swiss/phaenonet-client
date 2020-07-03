import { MasterdataService } from '../../../masterdata/masterdata.service';
import { Observation } from '../../../observation/observation';
import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { MatDialog } from '@angular/material/dialog';
import { some } from 'fp-ts/lib/Option';
import { Observable, combineLatest } from 'rxjs';
import { first, map, mergeAll } from 'rxjs/operators';
import { IdLike } from '../../../masterdata/masterdata-like';
import { ObservationService } from '../../../observation/observation.service';
import { PhenophaseObservation } from '../../../observation/phenophase-observation';
import { PhenophaseObservationsGroup } from '../../../observation/phenophase-observations-group';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { Individual } from '../../individual';
import { PhenophaseDialogComponent } from '../../phenophase-dialog.component';
import { findFirst } from 'fp-ts/lib/Array';
import { altitudeLimits } from 'src/app/masterdata/altitude-limits';

@Component({
  selector: 'app-individual-observation-view',
  templateUrl: './individual-observation-view.component.html',
  styleUrls: ['./individual-observation-view.component.scss']
})
export class ObservationViewComponent implements OnInit {
  @Input() individual: Observable<Individual>;
  @Input() individualId: string;
  @Input() isEditable: Observable<boolean>;

  phenophaseObservationsGroups: Observable<PhenophaseObservationsGroup[]>;
  staticComments = {};

  constructor(
    private dialog: MatDialog,
    private observationService: ObservationService,
    private masterdataService: MasterdataService,
    private analytics: AngularFireAnalytics
  ) { }

  ngOnInit() {
    const availablePhenophases = this.individual.pipe(map(i => this.masterdataService.getPhenophases(i.species)), mergeAll());
    const availablePhenophaseGroups = this.individual.pipe(map(i => this.masterdataService.getPhenophaseGroups(i.species)), mergeAll());
    const individualObservations = this.observationService.listByIndividual(this.individualId);
    const availableComments = this.masterdataService.getComments();

    // combine the available phenophases with the existing observations
    this.phenophaseObservationsGroups = combineLatest([
      this.individual,
      availablePhenophaseGroups,
      availablePhenophases,
      individualObservations,
      availableComments
    ]).pipe(
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
                limits: altitudeLimits(individual.altitude, p.limits),
                observation: findFirst((o: Observation) => o.phenophase === p.id)(observations),
                availableComments: comments.filter(a => p.comments.find(commentId => commentId === a.id))
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
  }

  editPhenophaseDate(phenophaseObservation: PhenophaseObservation): void {
    const dialogRef = this.dialog.open(PhenophaseDialogComponent, {
      width: '615px',
      data: {
        phenophase: phenophaseObservation.phenophase,
        limits: phenophaseObservation.limits,
        observation: some(phenophaseObservation.observation.getOrElse({} as Observation)),
        availableComments: phenophaseObservation.availableComments
      } as PhenophaseObservation
    });

    dialogRef.afterClosed().subscribe((result: PhenophaseObservation) => {
      if (result) {
        this.individual.pipe(first()).subscribe(detail => {
          result.observation.map(observation => {
            // if this is a new observation the created date is not set
            if (!observation.created) {
              observation.individual = detail.individual;
              observation.individual_id = this.individualId;
              observation.phenophase = result.phenophase.id;
              observation.species = detail.species;
              observation.year = detail.year;
              observation.user = detail.user;
              observation.source = 'globe';
            }

            const observationId = [
              observation.individual,
              observation.year,
              observation.species,
              observation.phenophase
            ].join('_');

            this.observationService
              .upsert(observation, observationId);

            this.analytics.logEvent(observation.created ? 'observation.modify' : 'observation.create', {
              species: detail.species,
              phenophase: result.phenophase.id,
            });
          });
        });
      }
    });
  }

  deletePhenophaseDate(phenophaseObservation: PhenophaseObservation): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '615px',
      data: {
        title: 'Löschen bestätigen',
        content: 'Möchten Sie diese Beobachtung wirklich löschen?',
        yes: 'Löschen',
        no: 'Abbrechen',
        yesColor: 'warn'
      } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        phenophaseObservation.observation.map(po =>
          this.observationService
            .delete((<IdLike><unknown>po).id)
            .then(() => this.analytics.logEvent('observation.delete'))
        );
      }
    });
  }
}
