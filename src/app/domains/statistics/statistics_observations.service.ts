import { Injectable } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { Observation } from '@shared/models/observation.model';
import { SourceFilterType } from '@shared/models/source-type.model';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AnalyticsType } from './statistics.model';

@Injectable({ providedIn: 'root' })
export class StatisticsObservationsService extends BaseResourceService<Observation> {
  // requires to be provided in root to save awhen leaving the component
  public statisticFilterState: FormGroup<{
    year: FormControl<string>;
    datasource: FormControl<SourceFilterType>;
    analyticsType: FormControl<AnalyticsType>;
    species: FormControl<string>;
  }>;

  constructor(
    protected afs: Firestore,
    protected fds: FirestoreDebugService
  ) {
    super(afs, 'observations', fds);
  }

  getObservations(
    year: string,
    analyticsType: AnalyticsType,
    source: SourceFilterType,
    species: string
  ): Observable<Observation[]> {
    const queryConstraints = [where('year', '==', parseInt(year, 10))];
    if (species !== 'all') {
      queryConstraints.push(where('species', '==', species));
    }

    return this.queryCollection(...queryConstraints).pipe(
      tap(x => this.fds.addRead(`${this.collectionName} (listByYear)`, x.length)),
      map(observations =>
        observations.map(o => ({
          date: o.date,
          individual: o.individual,
          individual_id: o.individual_id,
          phenophase: o.phenophase,
          species: o.species,
          year: o.year,
          user: o.user,
          comment: o.comment,
          created: o.created,
          modified: o.modified,
          source: o.source,
          tree_id: o.tree_id
        }))
      )
    );
  }
}
