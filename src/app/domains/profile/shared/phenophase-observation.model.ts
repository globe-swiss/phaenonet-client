import { AltitudeLimit } from '@masterdata/altitude-limits.model';
import { Comment } from '@masterdata/comment.model';
import { Phenophase } from '@masterdata/phaenophase.model';
import { Observation } from '@shared/models/observation.model';
import { Option } from 'fp-ts/lib/Option';

export class PhenophaseObservation {
  phenophase: Phenophase;
  limits: AltitudeLimit;
  observation: Option<Observation>;
  availableComments: Comment[];
}
