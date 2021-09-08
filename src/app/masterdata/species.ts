import { MasterdataLike } from './masterdata-like';
import { SourceType } from './source-type';

export class Species implements MasterdataLike {
  id: string;
  de: string;
  sources: SourceType[];
}
