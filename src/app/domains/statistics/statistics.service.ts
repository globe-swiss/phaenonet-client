import { Injectable } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { SourceFilterType } from '@shared/models/source-type.model';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Statistics } from '../../shared/models/statistics';
import { AltitudeFilterGroup, AnalyticsType, PhenophaseFilterType } from './statistics.model';

@Injectable({ providedIn: 'root' })
export class StatisticsService extends BaseResourceService<Statistics> {
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
    super(afs, 'statistics', fds);
  }

  getStatistics(
    year: string,
    phenophase: PhenophaseFilterType,
    altitude: AltitudeFilterGroup,
    species: string
  ): Observable<Statistics[]> {
    const queryConstraints = [where('year', '==', parseInt(year, 10))];
    if (species !== 'all') {
      queryConstraints.push(where('species', '==', species));
    }
    if (phenophase !== 'all') {
      queryConstraints.push(where('phenophase', '==', phenophase));
    }
    if (altitude !== 'all') {
      queryConstraints.push(where('altitude_grp', '==', altitude));
    }

    return this.queryCollection(...queryConstraints).pipe(
      tap(x => this.fds.addRead(`${this.collectionName} (listByYear)`, x.length)),
      map(statistics =>
        statistics.map(s => ({
          altitude_grp: s.altitude_grp,
          obs_number: s.obs_number,
          phenophase: s.phenophase,
          obs_woy: s.obs_woy,
          species: s.species,
          year: s.year
        }))
      )
    );
  }
}
