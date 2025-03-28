import { SourceType, allType, allValue } from '@shared/models/source-type.model';
import { AltitudeGroup, AnalyticsType } from './statistics-common.model';

export type FilterGraphType = 'weekly' | 'yearly';

export interface StatisticFilters {
  year: string;
  datasource: allType | SourceType;
  analyticsType: AnalyticsType;
  species: string;
  phenophase: string;
  altitude: allType | AltitudeGroup;
  graph: FilterGraphType;
}

export const allowedPhenophases = new Set(['BEA', 'BES', 'BFA', 'BLA', 'BLB', 'BVA', 'BVS', 'FRA']);
export const forbiddenSpecies = new Set(['IBM', 'ISS', 'IWA']);

export const analyticsTypesValues: AnalyticsType[] = ['species', 'altitude'];
export const altitudeGroupValues: AltitudeGroup[] = ['alt1', 'alt2', 'alt3', 'alt4', 'alt5'];

export const DEFAULT_FILTERS: StatisticFilters = {
  year: '',
  datasource: allValue,
  analyticsType: analyticsTypesValues[0],
  species: allValue,
  phenophase: allValue,
  altitude: allValue,
  graph: 'yearly'
};
