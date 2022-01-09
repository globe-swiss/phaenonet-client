export class User {
  nickname: string;
  firstname: string;
  lastname: string;
  locale: string;

  following_users?: string[];
  following_individuals?: string[];
}
