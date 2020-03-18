import { Option } from 'fp-ts/lib/Option';
import { Phenophase } from '../masterdata/phaenophase';
import { Observation } from '../observation/observation';

export class PhenophaseObservation {
  phenophase: Phenophase;
  observation: Option<Observation>;
}
