import { AllType, allValue, SourceType } from '@shared/models/source-type.model';
import { AltitudeGroup, AnalyticsType } from './statistics-common.model';

export type FilterGraphType = 'weekly' | 'yearly';
export type YearFilterType = `${number}` | AllType;

export interface StatisticFilters {
  year: YearFilterType;
  datasource: AllType | SourceType;
  analyticsType: AnalyticsType;
  species: string;
  phenophase: string;
  altitude: AllType | AltitudeGroup;
  graph: FilterGraphType;
}

export const allowedPhenophases = new Set(['BEA', 'BES', 'BFA', 'BLA', 'BLB', 'BVA', 'BVS', 'FRA']);
export const forbiddenSpecies = new Set(['IBM', 'ISS', 'IWA']);

export const analyticsTypesValues: AnalyticsType[] = ['species', 'altitude'];
export const altitudeGroupValues: AltitudeGroup[] = ['alt1', 'alt2', 'alt3', 'alt4', 'alt5'];

export const DEFAULT_FILTERS: StatisticFilters = {
  year: null,
  datasource: allValue,
  analyticsType: analyticsTypesValues[0],
  species: allValue,
  phenophase: allValue,
  altitude: allValue,
  graph: 'yearly'
};
