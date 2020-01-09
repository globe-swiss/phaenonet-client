import { User } from './user';

type LoginResultStatus = 'LOGIN_OK' | 'LOGIN_PASSWORD_CHANGE_REQUIRED';

export class LoginResult {
  status: LoginResultStatus;
  xsrfToken: string;
  user: User;

  constructor(status: LoginResultStatus, xsrfToken: string, user: User) {
    this.status = status;
    this.xsrfToken = xsrfToken;
    this.user = user;
  }
}
