import { AltitudeGroup } from './altitude-group.model';
import { AnalyticsType } from './analytics-type.model';
import { AnalyticsValue } from './analytics-value.model';

export class Analytics {
  source: string;
  species: string;
  type: AnalyticsType;
  altitude_grp: AltitudeGroup | null;
  year: number;
  values: AnalyticsValue[];
}
