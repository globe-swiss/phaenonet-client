import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { none } from 'fp-ts/lib/Option';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, first, map, mergeAll, switchMap, take } from 'rxjs/operators';
import { Activity } from '../activity/activity';
import { ActivityService } from '../activity/activity.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../auth/user.service';
import { BaseDetailComponent } from '../core/base-detail.component';
import { formatShortDate, formatShortDateTime } from '../core/formatDate';
import { NavService } from '../core/nav/nav.service';
import { IndividualPhenophase } from '../individual/individual-phenophase';
import { IndividualService } from '../individual/individual.service';
import { MasterdataService } from '../masterdata/masterdata.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';
import { ObservationService } from '../observation/observation.service';
import { PublicUser } from '../open/public-user';
import { PublicUserService } from '../open/public-user.service';

@Component({
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss']
})
export class ProfileDetailComponent extends BaseDetailComponent<PublicUser> implements OnInit {
  constructor(
    private navService: NavService,
    private router: Router,
    protected route: ActivatedRoute,
    private individualService: IndividualService,
    private observationService: ObservationService,
    private masterdataService: MasterdataService,
    private userService: UserService,
    private publicUserService: PublicUserService,
    private activityService: ActivityService,
    public dialog: MatDialog,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    super(publicUserService, route);
  }

  // temporary solution
  colorMap = {};

  profileLink: Observable<string>;

  latestIndividualObservations: Observable<IndividualPhenophase[]>;

  limitActivities = new BehaviorSubject<number>(8);
  limitIndividuals = new BehaviorSubject<number>(4);

  activities: Observable<Activity[]>;

  firstname: Observable<string>;
  lastname: Observable<string>;
  email: string;

  isFollowing: Observable<boolean>;

  formatShortDateTime = formatShortDateTime;
  formatShortDate = formatShortDate;

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Profil');

    this.colorMap = this.masterdataService.colorMap;

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
      }

      // combine the list of individuals with their phenophase
      // if the profile is of a foreign user, display only those with an observation
      this.latestIndividualObservations = combineLatest(
        [this.limitIndividuals, this.individualService.listByUser(this.detailId)],
        (limit, individuals) =>
          combineLatest(
            individuals
              .filter(i => this.isOwner() || i.last_observation_date !== undefined)
              .slice(0, limit)
              .map(individual => {
                return combineLatest(
                  this.masterdataService.getSpeciesValue(individual.species),
                  this.masterdataService.getPhenophaseValue(individual.species, individual.last_phenophase),
                  (species, phenophase) => {
                    return {
                      individual: individual,
                      species: species,
                      lastPhenophase: phenophase
                    } as IndividualPhenophase;
                  }
                );
              })
          )
      ).pipe(mergeAll());

      this.isFollowing = this.authService
        .getUserObservable()
        .pipe(map(u => (u.following_users ? u.following_users.find(id => id === this.detailId) !== undefined : false)));

      this.activities = this.limitActivities.pipe(
        switchMap(limit => this.activityService.listByUser(this.detailId, limit).pipe(take(1)))
      );
    });
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

  /**
   * show 1000 for now
   */
  showAllActivities() {
    this.limitActivities.next(1000);
  }

  showMoreIndividuals() {
    this.limitIndividuals.next(100);
  }

  follow(): void {
    this.userService
      .followUser(this.detailId)
      .pipe(first())
      .subscribe(_ => {
        this.alertService.infoMessage('Aktivitäten abonniert', 'Sie haben die Aktivitäten des Benutzers abonniert.');
      });
  }

  unfollow(): void {
    this.userService
      .unfollowUser(this.detailId)
      .pipe(first())
      .subscribe(_ => {
        this.alertService.infoMessage('Aktivitäten gekündigt', 'Sie erhalten keine Aktivitäten mehr dieses Benutzers.');
      });
  }

  logout() {
    this.limitActivities.unsubscribe();
    this.limitIndividuals.unsubscribe();
    this.detailSubject.unsubscribe();
    this.authService.logout();
  }
}
