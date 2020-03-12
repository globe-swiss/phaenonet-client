import { MasterdataLike } from './masterdata-like';

export class Comment implements MasterdataLike {
  id: string;
  de: string;
  seq: number;
}
