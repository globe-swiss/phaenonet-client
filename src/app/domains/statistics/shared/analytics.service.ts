import { Injectable } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { Phenophase } from '@shared/models/masterdata.model';
import { allType, allValue, SourceType } from '@shared/models/source-type.model';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Analytics } from './analytics.model';
import { AltitudeGroup, AnalyticsType } from './common.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsService extends BaseResourceService<Analytics> {
  constructor(
    protected afs: Firestore,
    protected fds: FirestoreDebugService
  ) {
    super(afs, 'analytics_result', fds);
  }

  listByYear(
    year: string,
    analyticsType: AnalyticsType,
    source: allType | SourceType,
    species: string
  ): Observable<Analytics[]> {
    const queryConstraints = [where('type', '==', analyticsType), where('source', '==', source)];
    if (species !== allValue) {
      queryConstraints.push(where('species', '==', species));
    }
    if (year !== allValue) {
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
    altitude: allType | AltitudeGroup,
    species: string
  ): Observable<Analytics[]> {
    const queryConstraints = [where('year', '==', parseInt(year, 10))];
    if (species !== allValue) {
      queryConstraints.push(where('species', '==', species));
    }
    if (phenophase.id !== allValue) {
      queryConstraints.push(where('phenophase', '==', phenophase));
    }
    if (altitude !== allValue) {
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
