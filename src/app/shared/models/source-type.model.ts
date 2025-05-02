export type AllType = 'all';
export const allValue = 'all';

export interface TranslatableFilterType {
  id: string;
  de: string;
}
export const allTranslatableFilterValue: TranslatableFilterType = { id: allValue, de: 'Alle' };

export type SourceType = 'globe' | 'meteoswiss' | 'ranger' | 'wld';
export const sourceValues: SourceType[] = ['globe', 'meteoswiss', 'ranger', 'wld'];
