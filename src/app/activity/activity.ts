import {firestore} from 'firebase/app';
import Timestamp = firestore.Timestamp;

export class Activity {
  action?: string;
  activity_date: Timestamp;
  followers: [string];
  individual_id: string;
  individual_name: string;
  observation_id?: string;
  phenophase: string;
  phenophase_name: string;
  source: string;
  species: string;
  species_name: string;
  type: string;
  user: string;
  user_name: string;
}
