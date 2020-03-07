import { Role } from './role';
import { FollowingUser } from '../profile/following-user';
import { FollowingIndividual } from '../profile/following-individual';

export class User {
  role: Role;
  nickname: string;
  firstname: string;
  lastname: string;

  followingUsers: FollowingUser[];
  followingIndividuals: FollowingIndividual[];
}
