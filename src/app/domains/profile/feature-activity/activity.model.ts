import { Timestamp } from '@angular/fire/firestore';
import { SourceType } from '@shared/models/source-type.model';

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
