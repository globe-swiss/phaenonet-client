import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AnalyticsType } from '../../domains/statistics/analytics-type.model'; //fixme
import { SourceFilterType } from '@shared/models/source-type.model';

@Injectable({ providedIn: 'root' })
export class FormPersistenceService {
  public mapFilter: FormGroup<{
    year: FormControl<number>;
    datasource: FormControl<SourceFilterType>;
    species: FormControl<string>;
  }>;
  public statisticFilter: FormGroup<{
    year: FormControl<string>;
    datasource: FormControl<SourceFilterType>;
    analyticsType: FormControl<AnalyticsType>;
    species: FormControl<string>;
  }>;
}
