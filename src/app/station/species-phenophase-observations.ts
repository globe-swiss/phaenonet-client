import { Species } from '../masterdata/species';
import { PhenophaseObservation } from './phenophase-observation';

export class SpeciesPhenophaseObservations {
  individualName?: string;
  species: Species;
  phenophaseObservations: PhenophaseObservation[];
}
