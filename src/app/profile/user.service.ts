import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { combineLatest, from, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseResourceService } from '../core/base-resource.service';
import { Individual } from '../individual/individual';
import { IndividualService } from '../individual/individual.service';
import { MasterdataService } from '../masterdata/masterdata.service';
import { AlertService } from '../messaging/alert.service';
import { PublicUser } from '../open/public-user';
import { PublicUserService } from '../open/public-user.service';
import { User } from './user';

@Injectable()
export class UserService extends BaseResourceService<User> {
  constructor(
    private publicUserService: PublicUserService,
    alertService: AlertService,
    protected afs: AngularFirestore,
    private authService: AuthService,
    private individualService: IndividualService,
    private masterdataService: MasterdataService
  ) {
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

  getFollowedIndividuals(limit$: Observable<number>): Observable<Individual[]> {
    return combineLatest([this.authService.user$, limit$, this.masterdataService.phenoYear$]).pipe(
      filter(
        ([user, limit, year]) =>
          user.following_individuals !== undefined && user.following_individuals.length !== 0 && year !== undefined
      ),
      switchMap(([user, limit, year]) => this.individualService.listByIds(user.following_individuals, year, limit))
    );
  }

  getFollowedUsers(limit$: Observable<number>): Observable<PublicUser[]> {
    return combineLatest([this.authService.user$, limit$]).pipe(
      filter(([user, limit]) => user.following_users !== undefined && user.following_users.length !== 0),
      switchMap(([user_ids, limit]) =>
        combineLatest(user_ids.following_users.slice(0, limit).map(user_id => this.publicUserService.get(user_id)))
      )
    );
  }
}
