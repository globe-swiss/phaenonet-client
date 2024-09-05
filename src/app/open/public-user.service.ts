import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { Roles } from '../profile/Roles.enum';
import { FirestoreDebugService } from '../shared/firestore-debug.service';
import { PublicUser } from './public-user';
import { UserService } from '../profile/user.service';

@Injectable()
export class PublicUserService extends BaseResourceService<PublicUser> {
  constructor(
    alertService: AlertService,
    protected afs: AngularFirestore,
    private authService: AuthService,
    private userService: UserService,
    protected fds: FirestoreDebugService
  ) {
    super(alertService, afs, 'public_users', fds);
  }

  existingNickname(nickname: string): Observable<boolean> {
    if (nickname && nickname.length > 0) {
      if (nickname === this.userService.user().nickname) {
        return of(false);
      }
      return this.afs
        .collection<PublicUser>(this.collectionName, ref => ref.where('nickname', '==', nickname))
        .valueChanges()
        .pipe(
          tap(x => this.fds.addRead(`${this.collectionName} (existingNickname)`, x.length)),
          first(),
          map(users => users.length > 0)
        );
    } else {
      return of(false);
    }
  }

  public isRanger(user$: Observable<PublicUser>): Observable<boolean> {
    return user$.pipe(
      map(u => (u.roles ? u.roles : [])),
      map(r => r.includes(Roles.RANGER))
    );
  }

  uniqueNicknameValidator(initialValue: string = ''): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      const controlValue = control.value as string;
      if (controlValue === null || controlValue.length === 0 || controlValue === initialValue) {
        return of(null);
      } else {
        if (controlValue.includes('/')) {
          return of({ invalidCharacters: { value: '/' } });
        } else {
          return this.existingNickname(controlValue).pipe(
            map(existingNickname => (existingNickname ? { existingNickname: { value: controlValue } } : null))
          );
        }
      }
    };
  }
}
