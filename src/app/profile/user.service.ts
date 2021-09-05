import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { combineLatest, from, Observable, of, Subscription } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseResourceService } from '../core/base-resource.service';
import { Individual } from '../individual/individual';
import { IndividualService } from '../individual/individual.service';
import { IdLike } from '../masterdata/masterdata-like';
import { MasterdataService } from '../masterdata/masterdata.service';
import { SourceType } from '../masterdata/source-type';
import { AlertService } from '../messaging/alert.service';
import { PublicUser } from '../open/public-user';
import { PublicUserService } from '../open/public-user.service';
import { Roles } from './Roles.enum';
import { User } from './user';

@Injectable()
export class UserService extends BaseResourceService<User> implements OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private roles$: Observable<string[]>;

  constructor(
    private publicUserService: PublicUserService,
    alertService: AlertService,
    protected afs: AngularFirestore,
    private authService: AuthService,
    private individualService: IndividualService,
    private masterdataService: MasterdataService
  ) {
    super(alertService, afs, 'users');
    this.roles$ = this.publicUserService
      .get(this.authService.getUserId())
      .pipe(map(publicUser => (publicUser.roles ? publicUser.roles : [])));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getUser(): Observable<User> {
    return this.get(this.authService.getUserId());
  }

  followIndividual(target: string | Observable<Individual>): Observable<void> {
    return this.individualObservable(target).pipe(
      first(),
      switchMap(id => this.followUnfollow({ following_individuals: firebase.firestore.FieldValue.arrayUnion(id) }))
    );
  }

  unfollowIndividual(target: string | Observable<Individual>): Observable<void> {
    return this.individualObservable(target).pipe(
      first(),
      switchMap(id => this.followUnfollow({ following_individuals: firebase.firestore.FieldValue.arrayRemove(id) }))
    );
  }

  followUser(target: string | Observable<PublicUser>): Observable<void> {
    return this.idObservable(target).pipe(
      first(),
      switchMap(id => this.followUnfollow({ following_users: firebase.firestore.FieldValue.arrayUnion(id) }))
    );
  }

  unfollowUser(target: string | Observable<PublicUser>): Observable<void> {
    return this.idObservable(target).pipe(
      first(),
      switchMap(id => this.followUnfollow({ following_users: firebase.firestore.FieldValue.arrayRemove(id) }))
    );
  }

  isFollowingUser(target: string | Observable<PublicUser>): Observable<boolean> {
    return combineLatest([this.idObservable(target), this.getUser()]).pipe(
      map(([id, user]) => user.following_users.includes(id))
    );
  }

  isFollowingIndividual(target: string | Observable<Individual>): Observable<boolean> {
    return combineLatest([this.individualObservable(target), this.getUser()]).pipe(
      map(([individual, user]) => user.following_individuals.includes(individual))
    );
  }

  private followUnfollow(partial: Partial<unknown>): Observable<void> {
    return from(this.afs.collection('users').doc(this.authService.getUserId()).update(partial));
  }

  getFollowedIndividuals(limit$: Observable<number>): Observable<Individual[]> {
    return combineLatest([this.authService.user$, limit$, this.masterdataService.phenoYear$]).pipe(
      filter(
        ([user, , year]) =>
          user.following_individuals !== undefined && user.following_individuals.length !== 0 && year !== undefined
      ),
      switchMap(([user, limit, year]) => this.individualService.listByIds(user.following_individuals, year, limit))
    );
  }

  getFollowedUsers(limit$: Observable<number>): Observable<PublicUser[]> {
    return combineLatest([this.authService.user$, limit$]).pipe(
      filter(([user]) => user.following_users !== undefined && user.following_users.length !== 0),
      switchMap(([user_ids, limit]) =>
        combineLatest(user_ids.following_users.slice(0, limit).map(user_id => this.publicUserService.get(user_id)))
      )
    );
  }

  private idObservable(target: string | Observable<IdLike>) {
    if (typeof target === 'string') {
      return of(target);
    } else {
      return target.pipe(map(x => x.id));
    }
  }

  private individualObservable(target: string | Observable<Individual>) {
    if (typeof target === 'string') {
      return of(target);
    } else {
      return target.pipe(map(x => x.individual));
    }
  }

  public getRoles(): Observable<string[]> {
    return this.roles$;
  }

  public isRanger(): Observable<boolean> {
    return this.roles$.pipe(map(roles => roles.includes(Roles.RANGER)));
  }

  public getSource(): Observable<SourceType> {
    return this.roles$.pipe(map(roles => (roles.includes(Roles.RANGER) ? 'ranger' : 'globe')));
  }
}
