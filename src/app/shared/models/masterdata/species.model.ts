import { SourceType } from '../source-type.model';
import { MasterdataLike } from './masterdata-like.model';

export class Species implements MasterdataLike {
  id: string;
  de: string;
  sources: SourceType[];
}
