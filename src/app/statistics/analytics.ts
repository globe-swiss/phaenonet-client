import { AltitudeGroup } from './altitude-group';
import { AnalyticsType } from './analytics-type';
import { AnalyticsValue } from './analytics-value';

export class Analytics {
  source: string;
  species: string;
  type: AnalyticsType;
  altitude_grp: AltitudeGroup | null;
  year: number;
  values: AnalyticsValue[];
}
