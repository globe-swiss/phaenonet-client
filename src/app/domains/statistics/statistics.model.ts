import { Species } from '@shared/models/masterdata.model';
import { Observation } from '@shared/models/observation.model';

export type AltitudeGroup = 'alt1' | 'alt2' | 'alt3' | 'alt4' | 'alt5';
export type AnalyticsType = 'species' | 'altitude';

export const allSpecies = { id: 'all', de: 'Alle' } as Species;
export const allYear = 'all';

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

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ObservationData {
  species: string;
  groupedByPhenophase: GroupedByPhenophaseGroup[];
}

export interface GroupedByPhenophaseGroup {
  phenophaseGroup: string;
  observations: Observation[];
}
