import firebase from 'firebase/compat/app';
import { SourceType } from '../masterdata/source-type';
import Timestamp = firebase.firestore.Timestamp;

export class Activity {
  action?: string;
  activity_date: Timestamp;
  followers: [string];
  individual_id: string;
  individual_name: string;
  observation_id?: string;
  phenophase: string;
  phenophase_name: string;
  source: SourceType;
  species: string;
  species_name: string;
  type: 'observation';
  user: string;
  user_name: string;
}
