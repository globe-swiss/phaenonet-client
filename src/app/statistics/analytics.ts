import { AnalyticsValue } from './analytics-value';
import { AnalyticsType } from './analytics-type';
import { AltitudeGroup } from './altitude-group';

export class Analytics {
  source: string;
  species: string;
  type: AnalyticsType;
  altitude_grp: AltitudeGroup | null;
  year: number;
  values: AnalyticsValue[];
}
