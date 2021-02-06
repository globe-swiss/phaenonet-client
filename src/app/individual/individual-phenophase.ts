import { Observable } from 'rxjs';
import { IdLike } from '../masterdata/masterdata-like';
import { Phenophase } from '../masterdata/phaenophase';
import { Species } from '../masterdata/species';
import { Individual } from './individual';

export class IndividualPhenophase {
  individual: Individual & IdLike;
  species: Species;
  lastPhenophase: Phenophase;
  imgUrl$: Observable<string>;
  type: 'station' | 'individual';
}
