import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { PublicUser } from './public-user';
import { map } from 'rxjs/operators';

@Injectable()
export class PublicUserService {
  collectionName = 'public_users';

  constructor(protected afs: AngularFirestore) {}

  getByUserId(userId: string): Observable<PublicUser> {
    return this.afs
      .collection<PublicUser>(this.collectionName, ref => ref.where('user', '==', userId))
      .valueChanges({ idField: 'id' })
      .pipe(map(publicUsers => (publicUsers.length > 0 ? publicUsers[0] : null)));
  }

  existingNickname(nickname: string): Observable<boolean> {
    if (nickname && nickname.length > 0) {
      return from(
        this.afs
          .collection(this.collectionName)
          .doc<PublicUser>(nickname)
          .ref.get()
          .then(r => r.exists)
      );
    } else {
      return of(false);
    }
  }
}
