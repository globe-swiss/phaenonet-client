import { AngularFireAnalytics } from '@angular/fire/analytics';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { none } from 'fp-ts/lib/Option';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, first, map, mergeAll, switchMap, take, filter } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../auth/user.service';
import { BaseDetailComponent } from '../core/base-detail.component';
import { formatShortDate, formatShortDateTime } from '../core/formatDate';
import { NavService } from '../core/nav/nav.service';
import { IndividualPhenophase } from '../individual/individual-phenophase';
import { IndividualService } from '../individual/individual.service';
import { MasterdataService } from '../masterdata/masterdata.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';
import { PublicUser } from '../open/public-user';
import { PublicUserService } from '../open/public-user.service';

@Component({
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss']
})
export class ProfileDetailComponent extends BaseDetailComponent<PublicUser> implements OnInit {
  constructor(
    private navService: NavService,
    protected route: ActivatedRoute,
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    private userService: UserService,
    private publicUserService: PublicUserService,
    public dialog: MatDialog,
    private authService: AuthService,
    private alertService: AlertService,
    private analytics: AngularFireAnalytics,
  ) {
    super(publicUserService, route);
  }

  // temporary solution
  colorMap = {};

  profileLink: Observable<string>;

  latestIndividualObservations: Observable<IndividualPhenophase[]>;

  limitIndividuals = new BehaviorSubject<number>(4);

  firstname: Observable<string>;
  lastname: Observable<string>;
  email: string;
  locale: Observable<string>;

  isFollowing: Observable<boolean>;

  isLoggedIn: boolean;

  formatShortDateTime = formatShortDateTime;
  formatShortDate = formatShortDate;

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Profil');

    this.colorMap = this.masterdataService.colorMap;

    this.isLoggedIn = this.authService.isLoggedIn();

    this.detailSubject.subscribe(detail => {
      this.profileLink = of(window.location.origin + '/profile/' + this.detailId);

      if (this.isOwner()) {
        this.email = this.authService.getUserEmail();
        this.firstname = this.userService.get(this.detailId).pipe(
          first(),
          map(u => u.firstname)
        );
        this.lastname = this.userService.get(this.detailId).pipe(
          first(),
          map(u => u.lastname)
        );
        this.locale = this.userService.get(this.detailId).pipe(
          first(),
          map(u => u.locale)
        );
      }

      // combine the list of individuals with their phenophase
      this.latestIndividualObservations = combineLatest(
        [this.limitIndividuals, this.individualService.listByUser(this.detailId)],
        (limit, individuals) =>
          combineLatest(
            individuals
              .sort((l, r) => {
                const l_hasnt_last_obs = l.last_observation_date ? false : true;
                const r_hasnt_last_obs = r.last_observation_date ? false : true;

                if (l_hasnt_last_obs && r_hasnt_last_obs) {
                  return 0;
                }
                if (l_hasnt_last_obs) {
                  return -1;
                }
                if (r_hasnt_last_obs) {
                  return 1;
                } else {
                  return (r.last_observation_date as any).toMillis() - (l.last_observation_date as any).toMillis();
                }
              })
              .slice(0, limit)
              .map(individual => {
                return combineLatest(
                  this.masterdataService.getSpeciesValue(individual.species),
                  this.masterdataService.getPhenophaseValue(individual.species, individual.last_phenophase),
                  (species, phenophase) => {
                    return {
                      individual: individual,
                      species: species,
                      lastPhenophase: phenophase,
                      imgUrl: this.individualService.getImageUrl(individual, true).pipe(
                        first(),
                        map(u => (u === null ? 'assets/img/pic_placeholder.svg' : u))
                      )
                    } as IndividualPhenophase;
                  }
                );
              })
          )
      ).pipe(mergeAll());

      this.isFollowing = this.authService.getUserObservable().pipe(
        filter(u => u !== null),
        map(u => (u.following_users ? u.following_users.find(id => id === this.detailId) !== undefined : false))
      );
    });

    this.analytics.logEvent('profile.view');
  }

  protected getDetailId(): Observable<string> {
    if (this.detailId == null) {
      return this.getRouteParam('id').pipe(
        catchError(_ => {
          return this.authService.getUserObservable().pipe(
            first(),
            map(_ => this.authService.getUserId())
          );
        })
      );
    } else {
      return of(this.detailId);
    }
  }

  isOwner(): boolean {
    return this.authService.getUserId() === this.detailId;
  }

  copyLinkToClipboard(inputElement: HTMLInputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

  notifyCopied() {
    this.alertService.alertMessage({
      title: 'Profil-Link',
      message: 'Der Link zum Profil wurde in die Zwischenablage kopiert.',
      level: Level.INFO,
      messageParams: [],
      titleParams: Object,
      duration: none
    } as UntranslatedAlertMessage);
  }

  showMoreIndividuals() {
    this.limitIndividuals.next(1000);
    this.analytics.logEvent('profile.show-more-individuals');
  }

  follow(): void {
    this.userService
      .followUser(this.detailId)
      .pipe(first())
      .subscribe(_ => {
        this.alertService.infoMessage('Aktivitäten abonniert', 'Sie haben die Aktivitäten des Benutzers abonniert.');
      });

      this.analytics.logEvent('follow-user');
  }

  unfollow(): void {
    this.userService
      .unfollowUser(this.detailId)
      .pipe(first())
      .subscribe(_ => {
        this.alertService.infoMessage('Aktivitäten gekündigt', 'Sie erhalten keine Aktivitäten mehr zu diesem Benutzer.');
      });

      this.analytics.logEvent('unfollow-user');
  }

  logout() {
    this.limitIndividuals.unsubscribe();
    this.detailSubject.unsubscribe();
    this.authService.logout();
  }
}
