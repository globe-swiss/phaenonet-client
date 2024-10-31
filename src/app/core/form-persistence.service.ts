import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SourceFilterType } from '../masterdata/source-type';
import { AnalyticsType } from '../statistics/analytics-type';

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
