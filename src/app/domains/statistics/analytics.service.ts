import { Injectable } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { Phenophase } from '@shared/models/masterdata.model';
import { SourceFilterType } from '@shared/models/source-type.model';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AltitudeFilterGroup, Analytics, AnalyticsType } from './statistics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService extends BaseResourceService<Analytics> {
  // requires to be provided in root to save awhen leaving the component
  public statisticFilterState: FormGroup<{
    year: FormControl<string>;
    datasource: FormControl<SourceFilterType>;
    analyticsType: FormControl<AnalyticsType>;
    species: FormControl<string>;
    phenophase: FormControl<Phenophase>;
    altitude: FormControl<AltitudeFilterGroup>;
  }>;

  constructor(
    protected afs: Firestore,
    protected fds: FirestoreDebugService
  ) {
    super(afs, 'analytics_result', fds);
  }

  listByYear(
    year: string,
    analyticsType: AnalyticsType,
    source: SourceFilterType,
    species: string
  ): Observable<Analytics[]> {
    const queryConstraints = [where('type', '==', analyticsType), where('source', '==', source)];
    if (species !== 'all') {
      queryConstraints.push(where('species', '==', species));
    }
    if (year !== 'all') {
      queryConstraints.push(where('year', '==', parseInt(year, 10)));
    }

    return this.queryCollection(...queryConstraints).pipe(
      tap(x => this.fds.addRead(`${this.collectionName} (listByYear)`, x.length)),
      map(analytics =>
        analytics.map(a => ({
          source: a.source,
          species: a.species,
          type: a.type,
          altitude_grp: a.altitude_grp,
          year: a.year,
          values: Object.entries(a.values).map(([k, v]) => ({
            phenophase: k,
            max: (v.max as any).toDate(),
            median: (v.median as any).toDate(),
            min: (v.min as any).toDate(),
            quantile_25: (v.quantile_25 as any).toDate(),
            quantile_75: (v.quantile_75 as any).toDate()
          }))
        }))
      )
    );
  }

  getAggregationObservations(
    year: string,
    phenophase: Phenophase,
    altitude: AltitudeFilterGroup,
    species: string
  ): Observable<Analytics[]> {
    const queryConstraints = [where('year', '==', parseInt(year, 10))];
    if (species !== 'all') {
      queryConstraints.push(where('species', '==', species));
    }
    if (phenophase.id !== 'all') {
      queryConstraints.push(where('phenophase', '==', phenophase));
    }
    if (altitude !== 'all') {
      queryConstraints.push(where('altitude_grp', '==', altitude));
    }

    return this.queryCollection(...queryConstraints).pipe(
      tap(x => this.fds.addRead(`${this.collectionName} (listByYear)`, x.length)),
      map(analytics =>
        analytics.map(a => ({
          source: a.source,
          species: a.species,
          type: a.type,
          altitude_grp: a.altitude_grp,
          year: a.year,
          values: Object.entries(a.values).map(([k, v]) => ({
            phenophase: k,
            max: (v.max as any).toDate(),
            median: (v.median as any).toDate(),
            min: (v.min as any).toDate(),
            quantile_25: (v.quantile_25 as any).toDate(),
            quantile_75: (v.quantile_75 as any).toDate()
          }))
        }))
      )
    );
  }
}
