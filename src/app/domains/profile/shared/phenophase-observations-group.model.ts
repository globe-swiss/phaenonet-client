import { PhenophaseGroup } from '@shared/models/masterdata.model';
import { PhenophaseObservation } from './phenophase-observation.model';

export class PhenophaseObservationsGroup {
  phenophaseGroup: PhenophaseGroup;
  phenophaseObservations: PhenophaseObservation[];
  hasObservations: boolean;
}
