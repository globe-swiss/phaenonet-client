import { SourceType, allType, sourceFilterValues } from '@shared/models/source-type.model';
import {
  AltitudeGroup,
  AnalyticsType,
  allPhenophases,
  allSpecies,
  selectableAltitudeGroup,
  selectableAnalyticsTypes
} from './common.model';

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

export const DEFAULT_FILTERS: StatisticFilters = {
  year: '',
  datasource: sourceFilterValues[0],
  analyticsType: selectableAnalyticsTypes[0],
  species: allSpecies.id,
  phenophase: allPhenophases.id,
  altitude: selectableAltitudeGroup[0],
  graph: 'yearly'
};
