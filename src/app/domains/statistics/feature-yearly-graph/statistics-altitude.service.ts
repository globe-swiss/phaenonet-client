import { Injectable } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { allValue, SourceType } from '@shared/models/source-type.model';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AllType } from '../../../shared/models/source-type.model';
import { AltitudeGroup, AnalyticsType } from '../shared/statistics-common.model';
import { YearFilterType } from '../shared/statistics-filter.model';
import { Analytics, StatisticsYearlyAltitude } from './statistics-yearly.model';

@Injectable({ providedIn: 'root' })
export class StatisticsAltitudeService extends BaseResourceService<StatisticsYearlyAltitude> {
  constructor(
    protected afs: Firestore,
    protected fds: FirestoreDebugService
  ) {
    super(afs, 'statistics_yearly_altitude', fds);
  }

  listByYear(year: YearFilterType, source: AllType | SourceType, species: string): Observable<Analytics[]> {
    const queryConstraints = [where('source', '==', source)];
    if (species !== allValue) {
      queryConstraints.push(where('species', '==', species));
    }
    if (year !== allValue) {
      queryConstraints.push(where('year', '==', year));
    }

    return this.queryCollection(...queryConstraints).pipe(
      tap(x => this.fds.addRead(`${this.collectionName} (listByYear)`, x.length)),
      map(statisticsYearlyAltitudeArray =>
        statisticsYearlyAltitudeArray.flatMap(a =>
          Object.entries(a.data).flatMap(([phenophase, altitudeMap]) =>
            Object.entries(altitudeMap).map(([altitude, stats]) => ({
              source: a.source,
              species: a.species,
              type: 'altitude' as AnalyticsType,
              altitude_grp: altitude as AltitudeGroup,
              year: a.year,
              values: [
                {
                  phenophase,
                  max: stats.max.toDate(),
                  median: stats.median.toDate(),
                  min: stats.min.toDate(),
                  quantile_25: stats.quantile_25.toDate(),
                  quantile_75: stats.quantile_75.toDate()
                }
              ]
            }))
          )
        )
      )
    );
  }
}
