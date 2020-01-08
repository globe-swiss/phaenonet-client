import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, OperatorFunction, throwError, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';

import { Role, roleOrdinal } from './role';
import { LoginResult } from './login-result';
import { User } from './user';
import { AlertService } from '../messaging/alert.service';
import { BaseHttpService } from '../core/base-http.service';
import { Option, some, none } from 'fp-ts/lib/Option';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Either, right, left } from 'fp-ts/lib/Either';
import { fromNullable } from 'fp-ts/lib/Option';
import { v4 as uuidV4 } from 'uuid';
import { HttpHeaders } from '@angular/common/http';

export const LOGIN_URL = '/auth/login';
export const LOGGED_OUT_URL = '/auth/logged-out';

const LOCALSTORAGE_LOGIN_RESULT_KEY = 'loginResult';

@Injectable()
export class AuthService extends BaseHttpService {
  browserIdHeaders: HttpHeaders;

  constructor(http: HttpClient, alertService: AlertService, private router: Router) {
    super(http, alertService);
  }

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  login(username: string, password: string): Observable<LoginResult> {
    return null; // TODO firebase login
  }

  private handleLoginResult(loginResult: LoginResult) {
    // this response has to include the set-cookie header to set the xsrf-token which will be used automatically by angular.
    if (loginResult && loginResult.status === 'LOGIN_OK') {
      localStorage.setItem(LOCALSTORAGE_LOGIN_RESULT_KEY, JSON.stringify(loginResult));
    }
  }

  private doLogin(url: string, data: Object): Observable<LoginResult> {
    // specific error handling in login.component.ts
    return this.withoutErrorHandling((client: HttpClient) =>
      client.post<LoginResult>(url, data).pipe(
        map((loginResult: LoginResult) => {
          this.handleLoginResult(loginResult);
          return loginResult;
        })
      )
    );
  }

  logout(): void {
    // we delete client session information anyway, so we don't need to inform the user about the failure
    this.withoutErrorHandling((client: HttpClient) => client.post('/api/auth/logout', {})).subscribe(() => {
      this.resetClientSession();
      this.router.navigate([LOGGED_OUT_URL]);
    });
  }

  resetClientSession() {
    localStorage.removeItem(LOCALSTORAGE_LOGIN_RESULT_KEY);
    this.removeCookie('XSRF-TOKEN');
  }

  private removeCookie(name: string, path: string = '/') {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=' + path;
  }

  isLoggedIn(): boolean {
    return this.getParsedLoginResult().isSome();
  }

  hasRole(role: Role): boolean {
    const loginResult = this.getParsedLoginResult();
    return loginResult.map(r => roleOrdinal(r.user.role) >= roleOrdinal(role)).getOrElse(false);
  }

  getUserFirstAndLastName(): string {
    return this.getUser()
      .map(u => u.firstName + ' ' + u.lastName)
      .getOrElse('Anonymous');
  }

  getUser(): Option<User> {
    const loginResult = this.getParsedLoginResult();
    return loginResult.mapNullable(r => r.user);
  }

  getXsrfToken(): Option<string> {
    const loginResult = this.getParsedLoginResult();
    return loginResult.mapNullable(r => r.xsrfToken);
  }

  private getParsedLoginResult(): Option<LoginResult> {
    const json = localStorage.getItem(LOCALSTORAGE_LOGIN_RESULT_KEY);
    if (json) {
      return some(JSON.parse(json));
    } else {
      return none;
    }
  }
}
