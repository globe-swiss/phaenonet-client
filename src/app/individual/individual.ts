import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

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
  station_species: string[];
  user: string;
  watering: string;
  year: number;
  last_observation_date?: Timestamp;
  last_phenophase?: string;
  created: Timestamp;
  modified: Timestamp;
  type: 'individual' | 'station';
  image_urls: string[];
}
