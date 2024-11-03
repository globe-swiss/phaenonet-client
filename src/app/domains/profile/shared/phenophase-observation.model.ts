import { AltitudeLimit } from '@shared/models/altitude-limits.model';
import { Phenophase, Comment } from '@shared/models/masterdata.model';
import { Observation } from '@shared/models/observation.model';
import { Option } from 'fp-ts/lib/Option';

export class PhenophaseObservation {
  phenophase: Phenophase;
  limits: AltitudeLimit;
  observation: Option<Observation>;
  availableComments: Comment[];
}
