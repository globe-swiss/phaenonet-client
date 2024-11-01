import { IdLike } from '@masterdata/masterdata-like.model';
import { Phenophase } from '@masterdata/phaenophase.model';
import { Species } from '@masterdata/species.model';
import { Observable } from 'rxjs';
import { Individual } from './individual.model';

export class IndividualPhenophase {
  individual: Individual & IdLike;
  species: Species;
  lastPhenophase: Phenophase;
  imgUrl$: Observable<string>;
  type: 'station' | 'individual';
}
