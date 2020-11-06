import { User } from './user';
import firebase from 'firebase/app';

type LoginResultStatus = 'LOGIN_OK' | 'LOGIN_PASSWORD_CHANGE_REQUIRED';

export class LoginResult {
  status: LoginResultStatus;
  user: User;
  firebaseUser: firebase.User;

  constructor(status: LoginResultStatus, firebaseUser: firebase.User, user: User) {
    this.status = status;
    this.user = user;
    this.firebaseUser = firebaseUser;
  }
}
