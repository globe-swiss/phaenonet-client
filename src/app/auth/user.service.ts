import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { User } from './user';

@Injectable()
export class UserService extends BaseResourceService<User> {
  constructor(alertService: AlertService, protected afs: AngularFirestore, private authService: AuthService) {
    super(alertService, afs, 'users');
  }

  getNickname(id: string): Observable<string> {
    return this.get(id).pipe(map(u => u.nickname));
  }

  followIndividual(target: string): Observable<void> {
    return this.followUnfollow({ following_individuals: firebase.firestore.FieldValue.arrayUnion(target) });
  }

  unfollowIndividual(target: string): Observable<void> {
    return this.followUnfollow({ following_individuals: firebase.firestore.FieldValue.arrayRemove(target) });
  }

  followUser(target: string): Observable<void> {
    return this.followUnfollow({ following_users: firebase.firestore.FieldValue.arrayUnion(target) });
  }

  unfollowUser(target: string): Observable<void> {
    return this.followUnfollow({ following_users: firebase.firestore.FieldValue.arrayRemove(target) });
  }

  private followUnfollow(partial: Partial<unknown>): Observable<void> {
    return from(this.afs.collection('users').doc(this.authService.getUserId()).update(partial));
  }
}
