import { Role } from './role';

export class User {
  role: Role;
  nickname: string;
  firstname: string;
  lastname: string;

  following_users: string[];
  following_individuals: string[];
}
