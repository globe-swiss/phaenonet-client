import { User } from './user';
import { User as FUser } from 'firebase/app';

type LoginResultStatus = 'LOGIN_OK' | 'LOGIN_PASSWORD_CHANGE_REQUIRED';

export class LoginResult {
  status: LoginResultStatus;
  user: User;
  firebaseUser: FUser;

  constructor(status: LoginResultStatus, firebaseUser: FUser, user: User) {
    this.status = status;
    this.user = user;
    this.firebaseUser = firebaseUser;
  }
}
