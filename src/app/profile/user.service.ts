import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { combineLatest, from, Observable, of, Subscription } from 'rxjs';
import { filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
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
import { FirestoreDebugService } from '../shared/firestore-debug.service';
import { Roles } from './Roles.enum';
import { User } from './user';

@Injectable()
export class UserService extends BaseResourceService<User> implements OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public publicUser$: Observable<PublicUser>;
  public user$: Observable<User>;
  public roles$: Observable<string[]>;

  constructor(
    private publicUserService: PublicUserService,
    alertService: AlertService,
    protected afs: AngularFirestore,
    private authService: AuthService,
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    protected fds: FirestoreDebugService
  ) {
    super(alertService, afs, 'users', fds);

    const sharedFirebaseUser$ = this.authService.firebaseUser$.pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.publicUser$ = sharedFirebaseUser$.pipe(
      switchMap(firebaseUser => this.publicUserService.get(firebaseUser.uid))
    );
    this.user$ = sharedFirebaseUser$.pipe(switchMap(firebaseUser => this.get(firebaseUser.uid)));
    // load roles or initialize roles array if public user document does not exist or roles array is not defined
    this.roles$ = this.publicUser$.pipe(map(publicUser => (publicUser && publicUser.roles ? publicUser.roles : [])));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  followUser(target: string | Observable<PublicUser & IdLike>): Observable<void> {
    return this.idObservable(target).pipe(
      first(),
      switchMap(id => this.followUnfollow({ following_users: firebase.firestore.FieldValue.arrayUnion(id) }))
    );
  }

  unfollowUser(target: string | Observable<PublicUser & IdLike>): Observable<void> {
    return this.idObservable(target).pipe(
      first(),
      switchMap(id => this.followUnfollow({ following_users: firebase.firestore.FieldValue.arrayRemove(id) }))
    );
  }

  isFollowingUser(target: string | Observable<PublicUser & IdLike>): Observable<boolean> {
    return combineLatest([this.idObservable(target), this.user$]).pipe(
      map(([id, user]) => (user.following_users ? user.following_users.includes(id) : false))
    );
  }

  isFollowingIndividual(target: string | Observable<Individual>): Observable<boolean> {
    return combineLatest([this.individualObservable(target), this.user$]).pipe(
      map(([individual, user]) =>
        user.following_individuals ? user.following_individuals.includes(individual) : false
      )
    );
  }

  private followUnfollow(partial: Partial<unknown>): Observable<void> {
    return from(this.afs.collection('users').doc(this.authService.getUserId()).update(partial)).pipe(
      tap(() => this.fds.addWrite('users (followUnfollow)'))
    );
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

  getFollowedUsers(limit$: Observable<number>): Observable<(PublicUser & IdLike)[]> {
    return combineLatest([this.authService.user$, limit$]).pipe(
      filter(([user]) => user.following_users !== undefined && user.following_users.length !== 0),
      switchMap(([user_ids, limit]) =>
        combineLatest(
          user_ids.following_users.slice(0, limit).map(user_id => this.publicUserService.getWithId(user_id))
        )
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

  public isRanger(): Observable<boolean> {
    return this.roles$.pipe(map(roles => roles.includes(Roles.RANGER)));
  }

  public getSource(): Observable<SourceType> {
    return this.roles$.pipe(map(roles => (roles.includes(Roles.RANGER) ? 'ranger' : 'globe'))); // todo: what about wald
  }
}
