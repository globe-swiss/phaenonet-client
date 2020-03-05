import { Phenophase } from '../masterdata/phaenophase';
import { Individual } from './individual';
import { IdLike } from '../masterdata/masterdata-like';
import { Species } from '../masterdata/species';

export class IndividualPhenophase {
  individual: Individual & IdLike;
  species: Species;
  lastPhenophase: Phenophase;
}
