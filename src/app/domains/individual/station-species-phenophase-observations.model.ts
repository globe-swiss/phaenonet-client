import { Species } from '@masterdata/species.model';
import { PhenophaseObservation } from './station-phenophase-observation.model';

export class SpeciesPhenophaseObservations {
  treeId?: string;
  species: Species;
  phenophaseObservations: PhenophaseObservation[];
}
