import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, first, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
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

  uniqueNicknameValidator(initialValue: string = ''): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Promise<{ [key: string]: any } | null> | Observable<{ [key: string]: any } | null> => {
      if (control.value === null || control.value.length === 0 || control.value === initialValue) {
        return of(null);
      } else {
        return control.valueChanges.pipe(
          debounceTime(250),
          take(1),
          switchMap(_ =>
            this.existingNickname(control.value).pipe(
              map(existingNickname => (existingNickname ? { existingNickname: { value: control.value } } : null))
            )
          )
        );
      }
    };
  }
}
