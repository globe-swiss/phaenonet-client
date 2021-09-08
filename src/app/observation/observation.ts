import firebase from 'firebase/compat/app';
import { SourceType } from '../masterdata/source-type';
import FieldValue = firebase.firestore.FieldValue;

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
}
