import { HttpHeaders } from '@angular/common/http';
import { Injectable, Signal, WritableSignal, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FirebaseError } from '@angular/fire/app';
import {
  Auth,
  EmailAuthProvider,
  User,
  authState,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { LocalService } from '@app/core/services/local.service';
import { AlertService, Level, UntranslatedAlertMessage } from '@core/services/alert.service';
import { none } from 'fp-ts/lib/Option';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

const LOCALSTORAGE_LOGGEDIN_KEY = 'loggedin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  browserIdHeaders: HttpHeaders;

  /**
   * @deprecated use signals instead
   */
  public firebaseUser$: Observable<User>;

  public authenticated: Signal<boolean>;
  public uid: Signal<string | null>;
  public email: WritableSignal<string | null> = signal<string | null>(null);

  redirectUrl: string;

  constructor(
    private alertService: AlertService,
    private afs: Firestore,
    private afAuth: Auth,
    private localService: LocalService
  ) {
    this.firebaseUser$ = authState(this.afAuth);
    const firebaseUser = toSignal(this.firebaseUser$);

    this.authenticated = toSignal(
      this.firebaseUser$.pipe(
        map(user => !!user) // Convert user object to boolean
      ),
      { initialValue: this.isCachedLoggedIn() }
    );

    this.uid = computed(() => firebaseUser()?.uid);

    onIdTokenChanged(this.afAuth, user => {
      this.email.set(user ? user.email : null);
    });

    effect(() => {
      this.setCachedLoginState(this.authenticated());
    });
  }

  login(email: string, password: string): Observable<boolean> {
    return from(
      signInWithEmailAndPassword(this.afAuth, email.trim(), password.trim())
        .then(() => {
          return true;
        })
        .catch(error => {
          this.errorHandling(error as FirebaseError);
          return false;
        })
    );
  }

  logout(): void {
    void signOut(this.afAuth);
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
        this.alertService.infoMessage('E-Mail geändert', 'Die E-Mail wurde erfolgreich geändert.');
      }
    } catch (error) {
      this.errorHandling(error as FirebaseError);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (await this.reauthUser(currentPassword)) {
      updatePassword(this.afAuth.currentUser, newPassword)
        .then(() => this.alertService.infoMessage('Passwort geändert', 'Das Passwort wurde erfolgreich geändert.'))
        .catch(error => this.errorHandling(error as FirebaseError));
    }
  }

  private async reauthUser(currentPassword: string) {
    const credentials = EmailAuthProvider.credential(this.email(), currentPassword);
    try {
      await reauthenticateWithCredential(this.afAuth.currentUser, credentials);
      return true;
    } catch (error) {
      return this.errorHandling(error as FirebaseError);
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
      await createUserWithEmailAndPassword(this.afAuth, email, password);
      void updateProfile(this.afAuth.currentUser, { displayName: nickname });
      void setDoc(doc(this.afs, 'users', this.afAuth.currentUser.uid), {
        nickname: nickname,
        firstname: firstname,
        lastname: lastname,
        locale: locale
      });
    } catch (error) {
      return this.errorHandling(error as FirebaseError);
    }
  }

  /**
   * Sets url to be redirected after next successful login.
   * @param redirectUrl
   */
  setRedirect(redirectUrl: string): void {
    this.redirectUrl = redirectUrl;
  }

  /**
   *
   * @returns @deprecated use signal instead
   */
  getUserId(): string | null {
    return this.afAuth.currentUser?.uid;
  }

  private errorHandling(error: FirebaseError, throwError = false) {
    console.error('error', error);

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
    }
  }

  private setCachedLoginState(loggedIn: boolean): void {
    if (loggedIn) {
      this.localService.localStorageSet(LOCALSTORAGE_LOGGEDIN_KEY, '1');
    } else {
      this.localService.localStorageRemove(LOCALSTORAGE_LOGGEDIN_KEY);
    }
  }

  private isCachedLoggedIn(): boolean {
    return !!this.localService.localStorageGet(LOCALSTORAGE_LOGGEDIN_KEY);
  }
}
