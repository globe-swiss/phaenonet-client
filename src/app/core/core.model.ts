export interface IdLike {
  id: string;
}

export interface MaybeIdLike {
  id?: string;
}

export class PhenonetUser {
  nickname: string;
  firstname: string;
  lastname: string;
  locale: string;

  following_users?: string[];
  following_individuals?: string[];
}
