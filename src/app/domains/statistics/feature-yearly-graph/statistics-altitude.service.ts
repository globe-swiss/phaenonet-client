import { Injectable } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { AllType, allValue, SourceType } from '@shared/models/source-type.model';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
      tap(x => this.fds.addRead(`${this.collectionName} (${this.constructor.name}.listByYear)`, x.length)),
      map(statisticsYearlyAltitudeArray => this.statisticToAnalytics(statisticsYearlyAltitudeArray)),
      map(analytics => this.groupAltitudes(analytics))
    );
  }

  /**
   * Coverts database input to analytics-output format.
   * @param statistics Statistic input from the database
   * @returns Analytics output
   */
  private statisticToAnalytics(statistics: StatisticsYearlyAltitude[]): Analytics[] {
    return statistics.flatMap(a =>
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
    );
  }

  /**
   * Groups analytics values by altitude.
   * @param analytics ungrouped input
   * @returns Analytics array grouped by altitude
   */
  private groupAltitudes(analytics: Analytics[]) {
    const grouped = analytics.reduce(
      (acc, curr) => {
        const key = `${curr.source}_${curr.species}_${curr.altitude_grp}_${curr.year}`;
        if (!acc[key]) {
          acc[key] = { ...curr, values: [] };
        }
        acc[key].values.push(...curr.values);
        return acc;
      },
      {} as Record<string, Analytics>
    );
    return Object.values(grouped);
  }
}
