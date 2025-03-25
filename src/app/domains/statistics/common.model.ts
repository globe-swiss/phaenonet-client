import { Phenophase, Species } from '@shared/models/masterdata.model';
import { allType } from '@shared/models/source-type.model';

export type AltitudeGroup = 'alt1' | 'alt2' | 'alt3' | 'alt4' | 'alt5';
export type AnalyticsType = 'species' | 'altitude';

// todo check used?
export const allPhenophases = { id: 'all', de: 'Alle' } as Phenophase;
export const allSpecies = { id: 'all', de: 'Alle' } as Species;
export const allYear = 'all';

export const selectableAnalyticsTypes: AnalyticsType[] = ['species', 'altitude']; // fixme nameing
export const selectableAltitudeGroup: (allType | AltitudeGroup)[] = ['all', 'alt1', 'alt2', 'alt3', 'alt4', 'alt5']; // fixme nameing

export const allowedPhenophases = new Set(['BEA', 'BES', 'BFA', 'BLA', 'BLB', 'BVA', 'BVS', 'FRA']);
export const forbiddenSpecies = new Set(['IBM', 'ISS', 'IWA']);
