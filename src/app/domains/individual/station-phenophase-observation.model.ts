import { Phenophase } from '@shared/models/masterdata.model';
import { Observation } from '@shared/models/observation.model';
import { Option } from 'fp-ts/lib/Option';

export class PhenophaseObservation {
  phenophase: Phenophase;
  observation: Option<Observation>;
}
