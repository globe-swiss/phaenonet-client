import { Observation } from '@shared/models/observation.model';
import { AltitudeGroup, AnalyticsType } from '../shared/common.model';

export class AnalyticsValue {
  phenophase: string;
  max: Date;
  median: Date;
  min: Date;
  quantile_25: Date;
  quantile_75: Date;
}

export class Analytics {
  source: string;
  species: string;
  type: AnalyticsType;
  altitude_grp: AltitudeGroup | null;
  year: number;
  values: AnalyticsValue[];
}

export interface ObservationData {
  species: string;
  groupedByPhenophase: GroupedByPhenophaseGroup[];
}

export interface GroupedByPhenophaseGroup {
  phenophaseGroup: string;
  observations: Observation[];
}
