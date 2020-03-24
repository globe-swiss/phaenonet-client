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
  source: 'globe' | 'meteoswiss';
  species: string;
  user: string;
  watering: string;
  year: number;
  last_observation_date: Date | null;
  last_phenophase: string | null;
  created: Date;
  modified: Date;
  type: 'individual' | 'station';
  image_urls: string[];
}
