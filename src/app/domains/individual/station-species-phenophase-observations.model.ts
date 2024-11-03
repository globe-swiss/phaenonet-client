import { Species } from '@shared/models/masterdata.model';
import { PhenophaseObservation } from './station-phenophase-observation.model';

export class SpeciesPhenophaseObservations {
  treeId?: string;
  species: Species;
  phenophaseObservations: PhenophaseObservation[];
}
