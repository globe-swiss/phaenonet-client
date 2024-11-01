import { FieldValue } from '@angular/fire/firestore';
import { SourceType } from './source-type.model';

export class Observation {
  date: Date;
  individual: string;
  individual_id: string;
  phenophase: string;
  species: string;
  year: number;
  user: string;
  comment: string | FieldValue;
  created: Date;
  modified: Date;
  source: SourceType;
  tree_id?: string;
}
