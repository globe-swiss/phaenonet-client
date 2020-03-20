import { Phenophase } from '../masterdata/phaenophase';
import { Option } from 'fp-ts/lib/Option';
import { Observation } from './observation';
import { Comment } from '../masterdata/comment';
import { AltitudeLimit } from '../masterdata/altitude-limits';

export class PhenophaseObservation {
  phenophase: Phenophase;
  limits: AltitudeLimit;
  observation: Option<Observation>;
  availableComments: Comment[];
}
