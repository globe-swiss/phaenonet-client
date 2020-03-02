import { Phenophase } from '../masterdata/phaenophase';
import { Option } from 'fp-ts/lib/Option';
import { Observation } from './observation';

export class PhenophaseObservation {
  phenophase: Phenophase;
  observation: Option<Observation>;
}
