import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseResourceService } from '../core/base-resource.service';
import { SourceFilterType } from '../masterdata/source-type';
import { AlertService } from '../messaging/alert.service';
import { FirestoreDebugService } from '../shared/firestore-debug.service';
import { Analytics } from './analytics';
import { AnalyticsType } from './analytics-type';

@Injectable()
export class StatisticsService extends BaseResourceService<Analytics> {
  constructor(
    alertService: AlertService,
    protected afs: AngularFirestore,
    protected fds: FirestoreDebugService
  ) {
    super(alertService, afs, 'analytics_result', fds);
  }

  listByYear(
    year: string,
    analyticsType: AnalyticsType,
    source: SourceFilterType,
    species: string
  ): Observable<Analytics[]> {
    return this.afs
      .collection<Analytics>(this.collectionName, ref => {
        let query = ref.where('type', '==', analyticsType).where('source', '==', source);

        if (species !== 'all') {
          query = query.where('species', '==', species);
        }

        if (year !== 'all') {
          query = query.where('year', '==', parseInt(year, 10));
        }

        return query;
      })
      .valueChanges({ idField: 'id' })
      .pipe(
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
