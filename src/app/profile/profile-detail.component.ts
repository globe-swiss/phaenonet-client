import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { none } from 'fp-ts/lib/Option';
import { combineLatest, Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { Activity } from '../activity/activity';
import { ActivityService } from '../activity/activity.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user';
import { UserService } from '../auth/user.service';
import { BaseDetailComponent } from '../core/base-detail.component';
import { NavService } from '../core/nav/nav.service';
import { IndividualPhenophase } from '../individual/individual-phenophase';
import { IndividualService } from '../individual/individual.service';
import { MasterdataService } from '../masterdata/masterdata.service';
import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';
import { ObservationService } from '../observation/observation.service';

@Component({
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss']
})
export class ProfileDetailComponent extends BaseDetailComponent<User> implements OnInit {
  constructor(
    private navService: NavService,
    private router: Router,
    protected route: ActivatedRoute,
    private individualService: IndividualService,
    private observationService: ObservationService,
    private masterdataService: MasterdataService,
    private userService: UserService,
    private activityService: ActivityService,
    public dialog: MatDialog,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    super(userService, route);
  }

  // temporary solution
  colorMap = {
    KNS: '#4b9f6f',
    KNV: '#4b9f6f',
    BEA: '#7bb53b',
    BES: '#7bb53b',
    BFA: '#7bb53b',
    BLA: '#e8d439',
    BLB: '#e8d439',
    BLE: '#e8d439',
    FRA: '#e8b658',
    FRB: '#e8b658',
    BVA: '#b29976',
    BVS: '#b29976'
  };

  profileLink: Observable<string>;

  latestIndividualObservations: Observable<IndividualPhenophase[]>;

  limitActivities = new BehaviorSubject<number>(8);

  activities: Observable<Activity[]>;

  email: string;

  isFollowing: Observable<boolean>;

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Profil');

    this.detailSubject.subscribe(detail => {
      this.profileLink = of(window.location + '/' + this.detailId);

      this.email = this.authService.getUserEmail();

      // combine the list of individuals with their phenophase
      this.latestIndividualObservations = this.individualService.listByUser(this.detailId, 4).pipe(
        mergeMap(individuals => {
          return combineLatest(
            individuals.map(individual => {
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
          );
        })
      );

      this.activities = this.limitActivities.pipe(
        switchMap(limit => this.activityService.listByUser(this.authService.getUserId(), limit))
      );

      this.isFollowing = this.authService
        .getUserObservable()
        .pipe(map(u => u.following_users.find(id => id === this.detailId) !== undefined));
    });
  }

  protected getDetailId(): Observable<string> {
    if (this.detailId == null) {
      return this.getRouteParam('id').pipe(
        catchError(_ => {
          return this.authService.getUserObservable().pipe(map(_ => this.authService.getUserId()));
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

  follow(): void {
    this.userService.followUser(this.detailId);
  }

  unfollow(): void {
    this.userService.unfollowUser(this.detailId);
  }
}
