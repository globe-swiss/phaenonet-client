import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { none } from 'fp-ts/lib/Option';
import { from, Observable, of } from 'rxjs';
import { switchMap, mergeAll, switchAll, take, tap, map } from 'rxjs/operators';
import { BaseService } from '../core/base.service';
import { LanguageService } from '../core/language.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';
import { LoginResult } from './login-result';
import { User } from './user';
import firebase from 'firebase/app';

export const LOGIN_URL = '/auth/login';
export const LOGGED_OUT_URL = '/auth/logged-out';

const LOCALSTORAGE_LOGIN_RESULT_KEY = 'loginResult';

@Injectable()
export class AuthService extends BaseService {
  browserIdHeaders: HttpHeaders;

  private user$: Observable<User>;
  private firebaseUser: firebase.User;

  constructor(
    alertService: AlertService,
    private router: Router,
    private languageService: LanguageService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    super(alertService);

    const self = this;
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
    this.user$.subscribe();
  }

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  login(email: string, password: string): Observable<User> {
    return from(
      this.afAuth
        .signInWithEmailAndPassword(email, password)
        .then(firebaseResult => {
          return this.handleUserLogin(firebaseResult);
        })
        .catch(this.errorHandling.bind(this))
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

  changePassword(currentPassword: string, password: string) {
    const credentials = firebase.auth.EmailAuthProvider.credential(this.getUserEmail(), currentPassword);

    this.afAuth.currentUser.then(user => {
      return user.reauthenticateWithCredential(credentials).then(
        _ => {
          this.afAuth.currentUser.then(user => {
            return user.updatePassword(password).then(_ => {
              this.alertService.infoMessage('Passwort geändert', 'Das Passwort wurde erfolgreich geändert.');
            });
          });
        },
        _ => {
          this.alertService.errorMessage('Passwort falsch', 'Das eingegebene aktuelle Passwort ist falsch.');
        }
      );
    });
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
            lang: this.languageService.determineCurrentLang(),
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

  /**
   * Email wasn't mandatory in the old application. This method is used to complete the existing account with an email address.
   * The given nickname has been migrated to the authentication database as `nickname@example.com`.
   *
   * @param nickname nickname from the old days
   * @param password existing password
   * @param email the new email address
   */
  completeAccount(nickname: string, password: string, email: string): Observable<any> {
    return from(
      this.afAuth
        .signInWithEmailAndPassword(this.nicknameAsEmail(nickname), password)
        .then(firebaseResult => {
          if (firebaseResult) {
            return from(
              firebaseResult.user
                .updateEmail(email)
                .then(_ => {
                  return this.login(email, password);
                })
                .catch(this.errorHandling.bind(this))
            ).pipe(mergeAll());
          }
        })
        .catch(this.errorHandling.bind(this))
    ).pipe(mergeAll());
  }

  private nicknameAsEmail(nickname: string): string {
    return nickname + '@example.com';
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
      return JSON.parse(json);
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
