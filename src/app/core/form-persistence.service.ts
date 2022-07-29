import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormPersistenceService {
  public mapFilter: UntypedFormGroup;
  public statisticFilter: UntypedFormGroup;
}
