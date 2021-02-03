import { HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { none } from 'fp-ts/lib/Option';
import { Observable, Subscription, from, of } from 'rxjs';
import { map, mergeAll, switchAll, switchMap, take, tap } from 'rxjs/operators';

import { BaseService } from '../core/base.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';
import { LoginResult } from './login-result';
import { User } from './user';

export const LOGIN_URL = '/auth/login';
export const LOGGED_OUT_URL = '/auth/logged-out';

const LOCALSTORAGE_LOGIN_RESULT_KEY = 'loginResult';

@Injectable()
export class AuthService extends BaseService implements OnDestroy {
  browserIdHeaders: HttpHeaders;

  private subscriptions = new Subscription();
  private user$: Observable<User>;
  private firebaseUser: firebase.User;

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  constructor(
    alertService: AlertService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    super(alertService);

    this.user$ = this.afAuth.authState.pipe(
      tap(user => (this.firebaseUser = user)),
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          this.resetClientSession();
          return of(null);
        }
      })
    );
    this.subscriptions.add(this.user$.subscribe());
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  login(email: string, password: string): Observable<User> {
    return from(
      this.afAuth
        .signInWithEmailAndPassword(email, password)
        .then(firebaseResult => {
          return this.handleUserLogin(firebaseResult);
        })
        .catch(x => {
          this.errorHandling(x);
          return of(null);
        })
    ).pipe(switchAll());
  }

  private handleUserLogin(firebaseResult: any): Observable<User> {
    if (firebaseResult) {
      this.user$.pipe(take(1)).subscribe(u => {
        this.handleLoginResult(new LoginResult('LOGIN_OK', firebaseResult.user, u));
      });

      return this.user$;
    } else {
      return of(null);
    }
  }

  private handleLoginResult(loginResult: LoginResult) {
    if (loginResult && loginResult.status === 'LOGIN_OK') {
      localStorage.setItem(LOCALSTORAGE_LOGIN_RESULT_KEY, JSON.stringify(loginResult));
    }
  }

  logout(): void {
    this.afAuth.signOut().then(() => {
      this.router.navigate([LOGGED_OUT_URL]);
    });
  }

  resetClientSession() {
    localStorage.removeItem(LOCALSTORAGE_LOGIN_RESULT_KEY);
  }

  resetPassword(email: string): Observable<void> {
    return from(
      this.afAuth.sendPasswordResetEmail(email).catch(error => {
        // silently ignore errors
      })
    );
  }

  async changeEmail(newEmail: string, currentPassword: string) {
    const freshUser = await this.reauthUser(currentPassword);
    try {
      await freshUser.updateEmail(newEmail);
      this.alertService.infoMessage('E-Mail geändert', 'Die E-Mail wurde erfolgreich geändert.');
    } catch (error) {
      this.alertService.infoMessage(error.code + '.title', error.code + '.message');
      throw error;
    }
  }

  changePassword(currentPassword: string, newPassword: string) {
    this.reauthUser(currentPassword).then(freshUser => {
      const _ = freshUser.updatePassword(newPassword);
      this.alertService.infoMessage('Passwort geändert', 'Das Passwort wurde erfolgreich geändert.');
    });
  }

  private async reauthUser(currentPassword: string) {
    const credentials = firebase.auth.EmailAuthProvider.credential(this.getUserEmail(), currentPassword);
    const user = await this.afAuth.currentUser;
    try {
      await user.reauthenticateWithCredential(credentials);
      return this.afAuth.currentUser;
    } catch (error) {
      this.alertService.errorMessage('Passwort falsch', 'Das eingegebene aktuelle Passwort ist falsch.');
      throw error;
    }
  }

  register(
    email: string,
    password: string,
    nickname: string,
    firstname: string,
    lastname: string,
    locale: string
  ): Observable<User> {
    this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then(firebaseResult => {
        firebaseResult.user.updateProfile({ displayName: nickname });

        this.afs
          .collection('users')
          .doc(firebaseResult.user.uid)
          .set({
            nickname: nickname,
            firstname: firstname,
            lastname: lastname,
            locale: locale
          })
          .then(_ => this.handleUserLogin(firebaseResult));
      })
      .catch(this.errorHandling.bind(this));

    return this.user$;
  }

  private removeCookie(name: string, path: string = '/') {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=' + path;
  }

  // might report false on initial page loading until userId is set
  isLoggedIn(): boolean {
    return this.getUserId() != null && this.getUser() != null;
  }

  isAuthenticated(redirectUrl: string): Observable<boolean> {
    return this.user$.pipe(
      take(1),
      map(user => !!user && this.getUser() != null), // also check if user data is present
      tap(authenticated => {
        if (!authenticated) {
          this.redirectUrl = redirectUrl;
          this.router.navigate([LOGIN_URL]);
        }
      })
    );
  }

  getUserNickname(): string {
    const user = this.getUser();
    if (user) {
      return user.nickname;
    } else {
      return 'Anonymous';
    }
  }

  getUserEmail(): string {
    if (this.firebaseUser) {
      return this.firebaseUser.email;
    } else {
      return 'Anonymous';
    }
  }

  getUser(): User | null {
    const json = localStorage.getItem(LOCALSTORAGE_LOGIN_RESULT_KEY);
    if (json) {
      return JSON.parse(json).user;
    } else {
      return null;
    }
  }

  getUserObservable(): Observable<User> {
    return this.user$;
  }

  getUserId(): string {
    if (this.firebaseUser == null) {
      return null;
    }
    return this.firebaseUser.uid;
  }

  private errorHandling(error: any) {
    this.alertService.alertMessage({
      title: error.code + '.title',
      message: error.code + '.message',
      level: Level.ERROR,
      messageParams: {
        error: error
      },
      titleParams: Object,
      duration: none
    } as UntranslatedAlertMessage);
  }
}
