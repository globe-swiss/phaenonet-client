import firebase from 'firebase/compat/app';
import { PhenonetUser } from '../profile/user';

type LoginResultStatus = 'LOGIN_OK' | 'LOGIN_PASSWORD_CHANGE_REQUIRED';

export class LoginResult {
  status: LoginResultStatus;
  user: PhenonetUser;
  firebaseUser: firebase.User;

  constructor(status: LoginResultStatus, firebaseUser: firebase.User, user: PhenonetUser) {
    this.status = status;
    this.user = user;
    this.firebaseUser = firebaseUser;
  }
}

// TODO REMOVE THIS FILE
