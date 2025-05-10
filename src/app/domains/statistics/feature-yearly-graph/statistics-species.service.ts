import { Injectable } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { AllType, allValue, SourceType } from '@shared/models/source-type.model';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { YearFilterType } from '../shared/statistics-filter.model';
import { Analytics, StatisticsYearlySpecies } from './statistics-yearly.model';

@Injectable({ providedIn: 'root' })
export class StatisticsSpeciesService extends BaseResourceService<StatisticsYearlySpecies> {
  constructor(
    protected afs: Firestore,
    protected fds: FirestoreDebugService
  ) {
    super(afs, 'statistics_yearly_species', fds);
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
      map(statisticsYearlySpecies =>
        statisticsYearlySpecies.map(a => ({
          source: a.source,
          species: a.species,
          type: 'species',
          altitude_grp: null,
          year: a.year,
          values: Object.entries(a.data).map(([k, v]) => ({
            phenophase: k,
            max: v.max.toDate(),
            median: v.median.toDate(),
            min: v.min.toDate(),
            quantile_25: v.quantile_25.toDate(),
            quantile_75: v.quantile_75.toDate()
          }))
        }))
      )
    );
  }
}
