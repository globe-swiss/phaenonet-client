import { Observable } from 'rxjs';
import { Individual } from './individual.model';
import { IdLike, Species, Phenophase } from './masterdata.model';

export class IndividualPhenophase {
  individual: Individual & IdLike;
  species: Species;
  lastPhenophase: Phenophase;
  imgUrl$: Observable<string>;
  type: 'station' | 'individual';
}
