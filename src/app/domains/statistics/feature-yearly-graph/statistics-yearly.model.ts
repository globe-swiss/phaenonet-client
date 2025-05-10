import { AltitudeGroup, AnalyticsType } from '../shared/statistics-common.model';
import { Timestamp } from '@angular/fire/firestore';

export class StatisticsYearlyValue {
  max: Timestamp;
  median: Timestamp;
  min: Timestamp;
  quantile_25: Timestamp;
  quantile_75: Timestamp;
  obs_sum: number;
}

export class StatisticsYearlySpecies {
  source: string;
  species: string;
  year: number;
  data: { [phenophase: string]: StatisticsYearlyValue };
}

export class StatisticsYearlyAltitude {
  source: string;
  species: string;
  year: number;
  data: { [phenophase: string]: { [K in AltitudeGroup]: StatisticsYearlyValue } };
}

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
