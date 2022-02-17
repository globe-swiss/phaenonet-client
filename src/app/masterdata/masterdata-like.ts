export interface MasterdataLike {
  id: string;
  de: string;
}

export interface SortedMasterdataLike extends MasterdataLike {
  seq: number;
}

export interface IdLike {
  id: string;
}

export interface MaybeIdLike {
  id?: string;
}
