import { Timestamp } from '@angular/fire/firestore';
import { IdLike } from '../masterdata/masterdata-like';
import { SourceType } from '../masterdata/source-type';

export type IndividualType = 'individual' | 'station';

export class Individual {
  name: string;
  geopos: google.maps.LatLngLiteral;
  altitude: number;
  description: string;
  exposition: string;
  forest: string;
  gradient: number;
  habitat: string;
  individual: string;
  less100: string;
  distance: string;
  shade: string;
  source: SourceType;
  species?: string;
  station_species?: string[];
  user: string;
  watering: string;
  year: number;
  last_observation_date?: Timestamp;
  last_phenophase?: string;
  created: Timestamp;
  modified: Timestamp;
  type: IndividualType;
  image_urls: string[];
}

export class MapIndividual implements IdLike {
  geopos: google.maps.LatLngLiteral;
  source: SourceType;
  species?: string;
  station_species?: string[];
  last_phenophase?: string;
  type: IndividualType;

  constructor(
    id: string,
    geopos: google.maps.LatLngLiteral,
    source: SourceType,
    type: IndividualType,
    species?: string,
    station_species?: string[],
    last_phenophase?: string
  ) {
    this.id = id;
    this.geopos = geopos;
    this.source = source;
    this.species = species;
    this.station_species = station_species;
    this.last_phenophase = last_phenophase;
    this.type = type;
  }
  id: string;
}
