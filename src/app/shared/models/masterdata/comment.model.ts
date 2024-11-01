import { MasterdataLike } from './masterdata-like.model';

export class Comment implements MasterdataLike {
  id: string;
  de: string;
  seq: number;
}
