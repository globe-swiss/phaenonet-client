import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { FollowingIndividual } from '../profile/following-individual';
import { FollowingUser } from '../profile/following-user';
import { User } from './user';

@Injectable()
export class UserService extends BaseResourceService<User> {
  constructor(alertService: AlertService, protected afs: AngularFirestore, private authService: AuthService) {
    super(alertService, afs, 'users');
  }

  getNickname(id: string): Observable<string> {
    return this.get(id).pipe(map(u => u.nickname));
  }

  followIndividual(following: FollowingIndividual) {
    this.followUnfollow({ followingIndividual: firebase.firestore.FieldValue.arrayUnion(following) });
  }

  unfollowIndividual(following: FollowingIndividual) {
    this.followUnfollow({ followingIndividual: firebase.firestore.FieldValue.arrayRemove(following) });
  }

  followUser(following: FollowingUser) {
    this.followUnfollow({ followingUser: firebase.firestore.FieldValue.arrayUnion(following) });
  }

  unfollowUser(following: FollowingUser) {
    this.followUnfollow({ followingUser: firebase.firestore.FieldValue.arrayRemove(following) });
  }

  private followUnfollow(partial: Partial<unknown>) {
    this.afs
      .collection('users')
      .doc(this.authService.getUserId())
      .update(partial);
  }
}
