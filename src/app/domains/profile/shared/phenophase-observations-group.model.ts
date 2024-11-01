import { PhenophaseGroup } from '@masterdata/phaenophase-group.model';
import { PhenophaseObservation } from './phenophase-observation.model';

export class PhenophaseObservationsGroup {
  phenophaseGroup: PhenophaseGroup;
  phenophaseObservations: PhenophaseObservation[];
  hasObservations: boolean;
}
