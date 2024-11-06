import { Observable } from 'rxjs';
import { Individual } from './individual.model';
import { Species, Phenophase } from './masterdata.model';
import { IdLike } from '@core/core.model';

export class IndividualPhenophase {
  individual: Individual & IdLike;
  species: Species;
  lastPhenophase: Phenophase;
  imgUrl$: Observable<string>;
  type: 'station' | 'individual';
}
