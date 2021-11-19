import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormPersistenceService {
  public mapFilter: FormGroup;
  public statisticFilter: FormGroup;
}
