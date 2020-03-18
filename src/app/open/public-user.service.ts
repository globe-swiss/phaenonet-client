import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { PublicUser } from './public-user';

@Injectable()
export class PublicUserService extends BaseResourceService<PublicUser> {
  constructor(alertService: AlertService, protected afs: AngularFirestore) {
    super(alertService, afs, 'public_users');
  }

  existingNickname(nickname: string): Observable<boolean> {
    if (nickname && nickname.length > 0) {
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
}
