export type AltitudeGroup = 'alt1' | 'alt2' | 'alt3' | 'alt4' | 'alt5';

export type AnalyticsType = 'species' | 'altitude';

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
