import { HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { none } from 'fp-ts/lib/Option';
import { Observable, Subscription, from, of } from 'rxjs';
import { map, switchAll, switchMap, take, tap } from 'rxjs/operators';
import { BaseService } from '../core/base.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';
import { User } from '../profile/user';
import { FirestoreDebugService } from '../shared/firestore-debug.service';
import { LocalService } from '../shared/local.service';
import { LoginResult } from './login-result';

export const LOGIN_URL = '/auth/login';
export const LOGGED_OUT_URL = '/auth/logged-out';

const LOCALSTORAGE_LOGIN_RESULT_KEY = 'loginResult';

@Injectable()
export class AuthService extends BaseService implements OnDestroy {
  browserIdHeaders: HttpHeaders;

  private subscriptions = new Subscription();
  public user$: Observable<User>;
  public firebaseUser$: Observable<firebase.User>;

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  constructor(
    alertService: AlertService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private fds: FirestoreDebugService,
    private localService: LocalService
  ) {
    super(alertService);

    this.firebaseUser$ = this.afAuth.authState.pipe(
      // multiple events on login
      tap(() => this.fds.addRead('firebaseUser'))
    );
    this.user$ = this.firebaseUser$.pipe(
      switchMap(user => {
        if (user) {
          return this.afs
            .doc<User>(`users/${user.uid}`)
            .valueChanges()
            .pipe(tap(() => this.fds.addRead('users')));
        } else {
          this.resetClientSession();
          return of(null) as Observable<User>;
        }
      })
    );
    this.subscriptions.add(this.user$.subscribe());
  }

  ngOnDestroy(): void {
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
          return of(null) as Observable<User>;
        })
    ).pipe(switchAll());
  }

  private handleUserLogin(firebaseResult: firebase.auth.UserCredential): Observable<User> {
    if (firebaseResult) {
      this.user$.pipe(take(1)).subscribe(u => {
        this.handleLoginResult(new LoginResult('LOGIN_OK', firebaseResult.user, u));
      });

      return this.user$;
    } else {
      return of(null) as Observable<User>;
    }
  }

  private handleLoginResult(loginResult: LoginResult) {
    if (loginResult && loginResult.status === 'LOGIN_OK') {
      this.setLoginCache(loginResult);
    }
  }

  logout(): void {
    void this.afAuth.signOut().then(() => {
      void this.router.navigate([LOGGED_OUT_URL]);
    });
  }

  resetClientSession(): void {
    this.localService.localStorageRemove(LOCALSTORAGE_LOGIN_RESULT_KEY);
  }

  resetPassword(email: string): Observable<void> {
    return from(
      this.afAuth.sendPasswordResetEmail(email).catch(() => {
        // silently ignore errors
      })
    );
  }

  async changeEmail(newEmail: string, currentPassword: string): Promise<void> {
    const freshUser = await this.reauthUser(currentPassword);
    try {
      await freshUser.updateEmail(newEmail);

      const loginCache = this.getLoginCache();
      loginCache.firebaseUser.email = newEmail;
      this.setLoginCache(loginCache);

      this.alertService.infoMessage('E-Mail geändert', 'Die E-Mail wurde erfolgreich geändert.');
    } catch (error) {
      this.alertService.infoMessage(`${error.code}.title`, `${error.code}.message`);
      throw error;
    }
  }

  changePassword(currentPassword: string, newPassword: string): void {
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
      this.alertService.errorMessage('Passwort falsch', 'Das aktuelle Passwort ist falsch.');
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
          void this.router.navigate([LOGIN_URL]);
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
    const firebaseUser = this.getFirebaseUser();
    if (firebaseUser) {
      return firebaseUser.email;
    } else {
      return 'Anonymous';
    }
  }

  getUser(): User | null {
    return this.getLoginCache()?.user;
  }

  private getFirebaseUser(): firebase.User | null {
    const cache = this.getLoginCache();
    return cache?.firebaseUser;
  }

  getUserId(): string {
    return this.getFirebaseUser()?.uid;
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

  private getLoginCache(): LoginResult | null {
    const json = this.localService.localStorageGet(LOCALSTORAGE_LOGIN_RESULT_KEY);
    return json ? (JSON.parse(json) as LoginResult) : null;
  }

  private setLoginCache(loginResult: LoginResult): void {
    this.localService.localStorageSet(LOCALSTORAGE_LOGIN_RESULT_KEY, JSON.stringify(loginResult));
  }
}
