import { HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  EmailAuthProvider,
  UserCredential,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateEmail,
  updatePassword,
  updateProfile,
  user
} from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { none } from 'fp-ts/lib/Option';
import { Observable, Subscription, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from '../core/base.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';
import { LocalService } from '../shared/local.service';

const LOCALSTORAGE_CREDENTIALS_KEY = 'credential_cache';

@Injectable()
export class AuthService extends BaseService implements OnDestroy {
  browserIdHeaders: HttpHeaders;
  private afAuth = inject(Auth);
  public firebaseUser$ = user(this.afAuth);
  public authenticated: Signal<boolean>;

  private subscriptions = new Subscription();

  // public phenonetUser$: Observable<PhenonetUser>;

  redirectUrl: string;

  constructor(
    alertService: AlertService,
    private afs: AngularFirestore,
    private localService: LocalService
  ) {
    super(alertService);

    this.authenticated = toSignal(
      this.firebaseUser$.pipe(
        map(user => !!user) // Convert user object to boolean
      ),
      { initialValue: false }
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  login(email: string, password: string): Observable<boolean> {
    return from(
      signInWithEmailAndPassword(this.afAuth, email.trim(), password.trim())
        .then(userCredential => {
          this.setCredentialCache(userCredential);
          return true;
        })
        .catch(error => {
          this.errorHandling(error);
          return false;
        })
    );
  }

  logout(): void {
    void this.afAuth.signOut().then(() => {
      this.resetClientSession();
    });
  }

  resetPassword(email: string): Observable<void> {
    return from(
      sendPasswordResetEmail(this.afAuth, email).catch(() => {
        // silently ignore errors
      })
    );
  }

  async changeEmail(newEmail: string, currentPassword: string): Promise<void> {
    try {
      if (await this.reauthUser(currentPassword)) {
        await updateEmail(this.afAuth.currentUser, newEmail);
      }
      this.alertService.infoMessage('E-Mail geändert', 'Die E-Mail wurde erfolgreich geändert.');
    } catch (error) {
      this.errorHandling(error);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (await this.reauthUser(currentPassword)) {
      updatePassword(this.afAuth.currentUser, newPassword)
        .then(() => this.alertService.infoMessage('Passwort geändert', 'Das Passwort wurde erfolgreich geändert.'))
        .catch(error => this.errorHandling(error));
    }
  }

  private async reauthUser(currentPassword: string) {
    const credentials = EmailAuthProvider.credential(this.getUserEmail(), currentPassword);
    try {
      const UserCredential = await reauthenticateWithCredential(this.afAuth.currentUser, credentials);
      this.setCredentialCache(UserCredential);
      return true;
    } catch (error) {
      return this.errorHandling(error);
    }
  }

  async register(
    email: string,
    password: string,
    nickname: string,
    firstname: string,
    lastname: string,
    locale: string
  ): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.afAuth, email, password);
      void updateProfile(this.afAuth.currentUser, { displayName: nickname });
      this.setCredentialCache(userCredential);
      void this.afs.collection('users').doc(this.afAuth.currentUser.uid).set({
        nickname: nickname,
        firstname: firstname,
        lastname: lastname,
        locale: locale
      });
    } catch (error) {
      return this.errorHandling(error);
    }
  }

  private removeCookie(name: string, path: string = '/') {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=' + path;
  }

  /**
   * Sets url to be redirected after next successful login.
   * @param redirectUrl
   */
  setRedirect(redirectUrl: string): void {
    this.redirectUrl = redirectUrl;
  }

  getUserEmail(): string {
    const firebaseUser = this.afAuth.currentUser;
    if (firebaseUser) {
      return firebaseUser.email;
    } else {
      return 'Anonymous';
    }
  }

  getUserId(): string {
    return this.afAuth.currentUser.uid;
  }

  private errorHandling(error: any, throwError = false) {
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
    if (throwError) {
      throw error;
    } // TODO check where to throw errors
  }

  resetClientSession(): void {
    this.localService.localStorageRemove(LOCALSTORAGE_CREDENTIALS_KEY);
  }

  private getCredentialCache(): UserCredential | null {
    const json = this.localService.localStorageGet(LOCALSTORAGE_CREDENTIALS_KEY);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return json ? JSON.parse(json) : null;
  }
  private setCredentialCache(userCredential: UserCredential): void {
    this.localService.localStorageSet(LOCALSTORAGE_CREDENTIALS_KEY, JSON.stringify(userCredential));
  }
}
