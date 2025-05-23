import { effect, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { arrayRemove, arrayUnion, Firestore } from '@angular/fire/firestore';
import { IdLike, PhenonetUser } from '@core/core.model';
import { AuthService } from '@core/services/auth.service';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { LanguageService } from '@core/services/language.service';
import { Individual } from '@shared/models/individual.model';
import { PublicUser } from '@shared/models/public-user.model';
import { SourceType } from '@shared/models/source-type.model';
import { Roles } from '@shared/models/user-roles.enum';
import { IndividualService } from '@shared/services/individual.service'; // fixme
import { MasterdataService } from '@shared/services/masterdata.service';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { PublicUserService } from './public-user.service';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseResourceService<PhenonetUser> {
  public publicUser$: Observable<PublicUser>;
  public publicUser: Signal<PublicUser>;
  public user$: Observable<PhenonetUser>;
  public user: Signal<PhenonetUser>;
  public roles$: Observable<string[]>;
  public roles: Signal<string[]>;

  constructor(
    private publicUserService: PublicUserService,
    protected afs: Firestore,
    private authService: AuthService,
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    private languageService: LanguageService,
    protected fds: FirestoreDebugService
  ) {
    super(afs, 'users', fds);

    const sharedFirebaseUser$ = this.authService.firebaseUser$.pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.publicUser$ = sharedFirebaseUser$.pipe(
      switchMap(firebaseUser => (firebaseUser?.uid ? this.publicUserService.get(firebaseUser.uid) : of(null)))
    );
    this.user$ = sharedFirebaseUser$.pipe(
      switchMap(firebaseUser => (firebaseUser?.uid ? this.get(firebaseUser.uid) : of(null)))
    );

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
        user?.following_individuals ? user.following_individuals.includes(individual) : false
      )
    );
  }

  // TODO test upsert! (former update op)
  private followUnfollow(partial: Partial<unknown>): Observable<void> {
    return this.upsert(partial, this.authService.getUserId()).pipe(
      tap(() => this.fds.addWrite('users (followUnfollow)')),
      map(() => {
        return; // map to void
      })
    );
  }

  getFollowedIndividuals(limit$: Observable<number>): Observable<Individual[]> {
    return combineLatest([this.user$, limit$, this.masterdataService.phenoYear$]).pipe(
      filter(
        ([user, , year]) =>
          user?.following_individuals !== undefined && user.following_individuals.length !== 0 && year !== undefined
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
