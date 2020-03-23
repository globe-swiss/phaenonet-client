import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { Analytics } from './analytics';
import { AnalyticsType } from './analytics-type';
import { SourceType } from '../masterdata/source-type';

@Injectable()
export class StatisticsService extends BaseResourceService<Analytics> {
  constructor(alertService: AlertService, protected afs: AngularFirestore) {
    super(alertService, afs, 'analytics_result');
  }

  listByYear(year: number, analyticsType: AnalyticsType, source: SourceType, species: string): Observable<Analytics[]> {
    return this.afs
      .collection<Analytics>(this.collectionName, ref => {
        const query = ref
          .where('year', '==', year)
          .where('type', '==', analyticsType)
          .where('source', '==', source);

        if (species !== 'all') {
          return query.where('species', '==', species);
        }

        return query;
      })
      .valueChanges({ idField: 'id' })
      .pipe(
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
