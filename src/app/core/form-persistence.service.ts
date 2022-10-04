import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SourceFilterType } from '../masterdata/source-type';

@Injectable({
  providedIn: 'root'
})
export class FormPersistenceService {
  public mapFilter: FormGroup<{
    year: FormControl<number>;
    datasource: FormControl<SourceFilterType>;
    species: FormControl<string>;
  }>;
  public statisticFilter: FormGroup;
}
