import { Species } from '../masterdata/species';
import { PhenophaseObservation } from './phenophase-observation';

export class SpeciesPhenophaseObservations {
  treeId?: string;
  species: Species;
  phenophaseObservations: PhenophaseObservation[];
}
