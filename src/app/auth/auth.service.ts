import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, OperatorFunction, throwError, of, from } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';

import { Role, roleOrdinal } from './role';
import { LoginResult } from './login-result';
import { User } from './user';
import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';
import { BaseHttpService } from '../core/base-http.service';
import { Option, some, none } from 'fp-ts/lib/Option';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Either, right, left } from 'fp-ts/lib/Either';
import { fromNullable } from 'fp-ts/lib/Option';
import { v4 as uuidV4 } from 'uuid';
import { HttpHeaders } from '@angular/common/http';
import { LanguageService } from '../core/language.service';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { auth } from 'firebase/app';
import { User as FUser } from 'firebase/app';

export const LOGIN_URL = '/auth/login';
export const LOGGED_OUT_URL = '/auth/logged-out';

const LOCALSTORAGE_LOGIN_RESULT_KEY = 'loginResult';

@Injectable()
export class AuthService extends BaseHttpService {
  browserIdHeaders: HttpHeaders;

  user: Observable<User>;
  firebaseUser: FUser;

  constructor(
    http: HttpClient,
    alertService: AlertService,
    private router: Router,
    private languageService: LanguageService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    super(http, alertService);

    const self = this;
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          self.firebaseUser = user;
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  login(email: string, password: string): Observable<User> {
    this.afAuth.auth
      .signInWithEmailAndPassword(email, password)
      .then(firebaseResult => {
        this.handleUserLogin(firebaseResult);
      })
      .catch(this.errorHandling.bind(this));

    return this.user;
  }

  private handleUserLogin(firebaseResult: any): void {
    if (firebaseResult) {
      this.firebaseUser = firebaseResult.user;
      this.user = this.afs.doc<User>(`users/${this.firebaseUser.uid}`).valueChanges();
      this.user.subscribe(u => {
        this.handleLoginResult(new LoginResult('LOGIN_OK', this.firebaseUser, u));
      });
    }
  }

  private handleLoginResult(loginResult: LoginResult) {
    if (loginResult && loginResult.status === 'LOGIN_OK') {
      localStorage.setItem(LOCALSTORAGE_LOGIN_RESULT_KEY, JSON.stringify(loginResult));
    }
  }

  logout(): void {
    this.afAuth.auth.signOut().then(() => {
      this.resetClientSession();
      this.router.navigate([LOGGED_OUT_URL]);
    });
  }

  resetClientSession() {
    localStorage.removeItem(LOCALSTORAGE_LOGIN_RESULT_KEY);
  }

  resetPassword(email: string): Observable<void> {
    return from(
      this.afAuth.auth.sendPasswordResetEmail(email).catch(error => {
        // silently ignore errors
      })
    );
  }

  register(
    email: string,
    password: string,
    displayName: string,
    firstname: string,
    lastname: string
  ): Observable<User> {
    const createDateTime = new Date().toISOString();
    this.afAuth.auth
      .createUserWithEmailAndPassword(email, password)
      .then(firebaseResult => {
        firebaseResult.user.updateProfile({ displayName: displayName });

        this.afs
          .collection('users')
          .doc(firebaseResult.user.uid)
          .set({
            email: email,
            lang: this.languageService.determineCurrentLang(),
            displayName: displayName,
            firstname: firstname,
            lastname: lastname,
            role: 'USER',
            create_dt: createDateTime,
            modify_dt: createDateTime
          })
          .then(_ => this.handleUserLogin(firebaseResult));
      })
      .catch(this.errorHandling.bind(this));

    return this.user;
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

  getUserDisplayName(): string {
    return this.getUser()
      .map(u => u.displayName)
      .getOrElse('Anonymous');
  }

  getUserEmail(): string {
    return this.getUser()
      .map(u => u.email)
      .getOrElse('Anonymous');
  }

  getUser(): Option<User> {
    const loginResult = this.getParsedLoginResult();
    return loginResult.mapNullable(r => r.user);
  }

  private getParsedLoginResult(): Option<LoginResult> {
    const json = localStorage.getItem(LOCALSTORAGE_LOGIN_RESULT_KEY);
    if (json) {
      return some(JSON.parse(json));
    } else {
      return none;
    }
  }

  private errorHandling(error: any) {
    if (error instanceof HttpErrorResponse) {
      this.alertService.alertMessage({
        title: 'Anmeldung fehlgeschlagen',
        message: 'login-server-failure',
        level: Level.ERROR,
        messageParams: error,
        titleParams: Object,
        duration: none
      } as UntranslatedAlertMessage);
    } else {
      this.alertService.alertMessage({
        title: 'Anmeldung fehlgeschlagen',
        message: 'login-unknown-failure',
        level: Level.ERROR,
        messageParams: {
          error: error
        },
        titleParams: Object,
        duration: none
      } as UntranslatedAlertMessage);
    }
  }
}
