import { Injectable } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { allType, SourceType } from '@shared/models/source-type.model';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Statistics } from './statistics.model';
import { AnalyticsType, AltitudeGroup } from './common.model';

@Injectable({ providedIn: 'root' })
export class StatisticsService extends BaseResourceService<Statistics> {
  // requires to be provided in root to save awhen leaving the component
  public statisticFilterState: FormGroup<{
    year: FormControl<string>;
    datasource: FormControl<allType | SourceType>;
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
    phenophase_id: string,
    altitude: allType | AltitudeGroup,
    species: string
  ): Observable<Statistics[]> {
    const queryConstraints = [where('display_year', '==', parseInt(year, 10))];

    if (species !== 'all') {
      queryConstraints.push(where('species', '==', species));
    }
    if (phenophase_id !== 'all') {
      queryConstraints.push(where('phenophase', '==', phenophase_id));
    }
    if (altitude !== 'all') {
      queryConstraints.push(where('altitude_grp', '==', altitude));
    }

    return this.queryCollection(...queryConstraints).pipe(
      tap(x => this.fds.addRead(`${this.collectionName} (getStatistics)`, x.length)),
      map(statisticsAggs =>
        statisticsAggs.map(sa => ({
          agg_obs_sum: sa.agg_obs_sum,
          agg_range: sa.agg_range,
          latitude_grp: sa.latitude_grp,
          end_year: sa.end_year,
          obs_woy: sa.obs_woy,
          phenophase: sa.phenophase,
          species: sa.species,
          start_year: sa.start_year,
          year_obs_sum: sa.year_obs_sum,
          years: sa.years
        }))
      )
    );
  }
}
