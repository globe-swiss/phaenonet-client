import { Injectable } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { PublicUser } from '@shared/models/public-user.model';
import { Roles } from '@shared/models/user-roles.enum';
import { Observable, of } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PublicUserService extends BaseResourceService<PublicUser> {
  constructor(
    protected afs: Firestore,
    protected fds: FirestoreDebugService
  ) {
    super(afs, 'public_users', fds);
  }

  existingNickname(nickname: string): Observable<boolean> {
    if (nickname && nickname.length > 0) {
      return this.queryCollection(where('nickname', '==', nickname)).pipe(
        tap(x => this.fds.addRead(`${this.collectionName} (${this.constructor.name}.existingNickname)`, x.length)),
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

  uniqueNicknameValidator(currentNickname = ''): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      const controlValue = control.value as string;
      if (controlValue != null && controlValue === currentNickname) {
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
