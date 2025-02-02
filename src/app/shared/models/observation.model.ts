import { FieldValue, Timestamp } from '@angular/fire/firestore';
import { SourceType } from './source-type.model';

export class Observation {
  date: Timestamp;
  individual: string;
  individual_id: string;
  phenophase: string;
  species: string;
  year: number;
  user: string;
  comment: string | FieldValue;
  created: Timestamp;
  modified: Timestamp;
  source: SourceType;
  tree_id?: string;
}
