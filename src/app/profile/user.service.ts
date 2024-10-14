import { effect, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { arrayRemove, arrayUnion } from '@angular/fire/firestore';
import { combineLatest, from, Observable, of } from 'rxjs';
import { filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { LanguageService } from 'src/app/core/language.service';
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
import { PhenonetUser } from './user';

@Injectable()
export class UserService extends BaseResourceService<PhenonetUser> {
  public publicUser$: Observable<PublicUser>;
  public publicUser: Signal<PublicUser>;
  public user$: Observable<PhenonetUser>;
  public user: Signal<PhenonetUser>;
  public roles$: Observable<string[]>;
  public roles: Signal<string[]>;

  constructor(
    private publicUserService: PublicUserService,
    alertService: AlertService,
    protected afs: AngularFirestore,
    private authService: AuthService,
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    private languageService: LanguageService,
    protected fds: FirestoreDebugService
  ) {
    super(alertService, afs, 'users', fds);

    const sharedFirebaseUser$ = this.authService.firebaseUser$.pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.publicUser$ = sharedFirebaseUser$.pipe(
      switchMap(firebaseUser => this.publicUserService.get(firebaseUser?.uid))
    );
    this.user$ = sharedFirebaseUser$.pipe(switchMap(firebaseUser => this.get(firebaseUser?.uid)));

    // load roles or initialize roles array if public user document does not exist or roles array is not defined
    this.roles$ = this.publicUser$.pipe(map(publicUser => (publicUser && publicUser.roles ? publicUser.roles : [])));

    this.user = toSignal(this.user$);
    this.publicUser = toSignal(this.publicUser$);
    this.roles = toSignal(this.roles$);

    effect(() => (this.user() ? this.languageService.changeLocale(this.user().locale) : null));
  }

  followIndividual(target: string | Observable<Individual>): Observable<void> {
    return this.individualObservable(target).pipe(
      first(),
      switchMap(id => this.followUnfollow({ following_individuals: arrayUnion(id) }))
    );
  }

  unfollowIndividual(target: string | Observable<Individual>): Observable<void> {
    return this.individualObservable(target).pipe(
      first(),
      switchMap(id => this.followUnfollow({ following_individuals: arrayRemove(id) }))
    );
  }

  followUser(target: string | Observable<PublicUser & IdLike>): Observable<void> {
    return this.idObservable(target).pipe(
      first(),
      switchMap(id => this.followUnfollow({ following_users: arrayUnion(id) }))
    );
  }

  unfollowUser(target: string | Observable<PublicUser & IdLike>): Observable<void> {
    return this.idObservable(target).pipe(
      first(),
      switchMap(id => this.followUnfollow({ following_users: arrayRemove(id) }))
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
    return combineLatest([this.user$, limit$, this.masterdataService.phenoYear$]).pipe(
      filter(
        ([user, , year]) =>
          user.following_individuals !== undefined && user.following_individuals.length !== 0 && year !== undefined
      ),
      switchMap(([user, limit, year]) => this.individualService.listByIds(user.following_individuals, year, limit))
    );
  }

  getFollowedUsers(limit$: Observable<number>): Observable<(PublicUser & IdLike)[]> {
    return combineLatest([this.user$, limit$]).pipe(
      filter(([user]) => user.following_users !== undefined && user.following_users.length !== 0),
      switchMap(([user, limit]) =>
        combineLatest(user.following_users.slice(0, limit).map(user_id => this.publicUserService.getWithId(user_id)))
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
    // defaults to globe source
    return this.roles$.pipe(map(roles => (roles.includes(Roles.RANGER) ? 'ranger' : 'globe')));
  }
}
