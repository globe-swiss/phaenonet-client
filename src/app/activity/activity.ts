import { Timestamp } from '@angular/fire/firestore';
import { SourceType } from '../masterdata/source-type';

export class Activity {
  action?: string;
  activity_date: Timestamp;
  followers: [string];
  individual_id: string;
  individual_name: string;
  observation_id?: string;
  phenophase: string;
  phenophase_name: any;
  source: SourceType;
  species: string;
  species_name: string;
  type: 'observation';
  user: string;
  user_name: string;
}
