import { Option } from 'fp-ts/lib/Option';

import { AltitudeLimit } from '../masterdata/altitude-limits';
import { Comment } from '../masterdata/comment';
import { Phenophase } from '../masterdata/phaenophase';
import { Observation } from './observation';

export class PhenophaseObservation {
  phenophase: Phenophase;
  limits: AltitudeLimit;
  observation: Option<Observation>;
  availableComments: Comment[];
}
