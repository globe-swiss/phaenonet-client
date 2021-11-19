import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { Roles } from '../profile/Roles.enum';
import { PublicUser } from './public-user';

@Injectable()
export class PublicUserService extends BaseResourceService<PublicUser> {
  constructor(alertService: AlertService, protected afs: AngularFirestore, private authService: AuthService) {
    super(alertService, afs, 'public_users');
  }

  get(id: string): Observable<PublicUser> {
    return this.afs.collection<PublicUser>(this.collectionName).doc<PublicUser>(id).valueChanges({ idField: 'id' });
  }

  existingNickname(nickname: string): Observable<boolean> {
    if (nickname && nickname.length > 0) {
      if (nickname === this.authService.getUserNickname()) {
        return of(false);
      }
      return this.afs
        .collection<PublicUser>(this.collectionName, ref => ref.where('nickname', '==', nickname))
        .valueChanges()
        .pipe(
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
