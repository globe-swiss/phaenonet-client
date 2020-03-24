import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { findFirst } from 'fp-ts/lib/Array';
import { some } from 'fp-ts/lib/Option';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { first, map, shareReplay } from 'rxjs/operators';
import { Activity } from '../activity/activity';
import { ActivityService } from '../activity/activity.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user';
import { UserService } from '../auth/user.service';
import { NavService } from '../core/nav/nav.service';
import { altitudeLimits } from '../masterdata/altitude-limits';
import { Comment } from '../masterdata/comment';
import { Description } from '../masterdata/description';
import { Distance } from '../masterdata/distance';
import { Exposition } from '../masterdata/exposition';
import { Forest } from '../masterdata/forest';
import { Habitat } from '../masterdata/habitat';
import { Irrigation } from '../masterdata/irrigation';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Phenophase } from '../masterdata/phaenophase';
import { PhenophaseGroup } from '../masterdata/phaenophase-group';
import { Shade } from '../masterdata/shade';
import { Species } from '../masterdata/species';
import { AlertService } from '../messaging/alert.service';
import { Observation } from '../observation/observation';
import { ObservationService } from '../observation/observation.service';
import { PhenophaseObservation } from '../observation/phenophase-observation';
import { PhenophaseObservationsGroup } from '../observation/phenophase-observations-group';
import { PublicUserService } from '../open/public-user.service';
import { BaseIndividualDetailComponent } from './base-individual-detail.component';
import { Individual } from './individual';
import { IndividualService } from './individual.service';
import { PhenophaseDialogComponent } from './phenophase-dialog.component';
import { formatShortDate } from '../core/formatDate';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  templateUrl: './individual-detail.component.html',
  styleUrls: ['./individual-detail.component.scss']
})
export class IndividualDetailComponent extends BaseIndividualDetailComponent implements OnInit {
  center = { lat: 46.818188, lng: 8.227512 };
  zoom = 13;
  options: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.HYBRID,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    draggable: false
  };
  markerOptions = new ReplaySubject<google.maps.MarkerOptions>(1);
  geopos: google.maps.LatLngLiteral = { lat: 46.818188, lng: 8.227512 };

  imageUrl: Observable<string>;

  lastPhenophase: Observable<Phenophase>;
  lastPhenophaseColor: Observable<string>;

  individualCreatorNickname: Observable<string>;
  species: Observable<Species>;
  description: Observable<Description>;
  exposition: Observable<Exposition>;
  shade: Observable<Shade>;
  habitat: Observable<Habitat>;
  forest: Observable<Forest>;
  distance: Observable<Distance>;
  irrigation: Observable<Irrigation>;

  availablePhenophases: Observable<Phenophase[]>;
  availablePhenophaseGroups: Observable<PhenophaseGroup[]>;
  availableComments: Observable<Comment[]>;
  individualObservations: Observable<Observation[]>;
  phenophaseObservationsGroups: Observable<PhenophaseObservationsGroup[]>;
  lastObservation: Observation;
  lastObservationDate: string;

  owner: string;

  currentUser: Observable<User>;
  isFollowing: Observable<boolean>;

  staticComments = {};

  constructor(
    private navService: NavService,
    private router: Router,
    protected route: ActivatedRoute,
    protected individualService: IndividualService,
    private observationService: ObservationService,
    private masterdataService: MasterdataService,
    protected userService: UserService,
    private publicUserService: PublicUserService,
    private activityService: ActivityService,
    public dialog: MatDialog,
    private authService: AuthService,
    protected alertService: AlertService,
    private afStorage: AngularFireStorage
  ) {
    super(route, individualService, userService, alertService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Station');

    this.currentUser = this.authService.getUserObservable();

    this.detailSubject.subscribe(detail => {
      if (detail.geopos) {
        this.geopos = detail.geopos;
        this.center = detail.geopos;
      }

      if (detail.image_urls) {
        // TODO: this should change on the data level
        this.imageUrl = this.afStorage
          .ref(
            detail.image_urls[0].substring(detail.image_urls[0].lastIndexOf('.com/') + 4, detail.image_urls[0].length)
          )
          .getDownloadURL();
      }

      this.isFollowing = this.currentUser.pipe(
        map(u =>
          u.following_individuals ? u.following_individuals.find(id => id === detail.individual) !== undefined : false
        )
      );

      this.owner = detail.user;

      this.species = this.masterdataService.getSpeciesValue(detail.species);
      this.description = this.masterdataService.getDescriptionValue(detail.description);
      this.exposition = this.masterdataService.getExpositionValue(detail.exposition);
      this.shade = this.masterdataService.getShadeValue(detail.shade);
      this.habitat = this.masterdataService.getHabitatValue(detail.habitat);
      this.forest = this.masterdataService.getForestValue(detail.forest);
      this.distance = this.masterdataService.getDistanceValue(detail.less100);
      this.irrigation = this.masterdataService.getIrrigationValue(detail.watering);

      this.individualCreatorNickname = this.publicUserService.get(detail.user).pipe(
        map(u => u.nickname),
        shareReplay()
      );

      this.availablePhenophases = this.masterdataService.getPhenophases(detail.species);
      this.availablePhenophaseGroups = this.masterdataService.getPhenophaseGroups(detail.species);
      this.individualObservations = this.observationService.listByIndividual(this.detailId);
      this.availableComments = this.masterdataService.getComments();

      this.lastPhenophase = this.availablePhenophases.pipe(
        map(phenophases => {
          return phenophases.find(p => p.id === detail.last_phenophase);
        })
      );

      this.lastPhenophaseColor = this.lastPhenophase.pipe(map(p => this.masterdataService.colorMap[p.id]));

      // combine the available phenophases with the existing observations
      this.phenophaseObservationsGroups = combineLatest([
        this.availablePhenophaseGroups,
        this.availablePhenophases,
        this.individualObservations,
        this.availableComments
      ]).pipe(
        map(([phenophaseGroups, phenophases, observations, comments]) => {
          this.lastObservation = observations.sort((o1, o2) => o1.date.getTime() - o2.date.getTime())[
            observations.length - 1
          ];

          if (this.lastObservation) {
            this.lastObservationDate = formatShortDate(this.lastObservation.date);
          }

          comments.forEach(element => {
            this.staticComments[element.id] = element.de;
          });

          return phenophaseGroups.map(phenophaseGroup => {
            const phenophaseObservations = phenophases
              .filter(p => p.group_id === phenophaseGroup.id)
              .map(p => {
                return {
                  phenophase: p,
                  limits: altitudeLimits(detail.altitude, p.limits),
                  observation: findFirst((o: Observation) => o.phenophase === p.id)(observations),
                  availableComments: comments.filter(a => p.comments.find(commentId => commentId === a.id))
                };
              });

            const hasObservations = phenophaseObservations.find(po => po.observation.isSome()) !== undefined;

            return {
              phenophaseGroup: phenophaseGroup,
              phenophaseObservations: phenophaseObservations,
              hasObservations: hasObservations
            };
          });
        })
      );

      this.markerOptions.next({
        draggable: false,
        icon: this.masterdataService.individualToIcon(detail)
      } as google.maps.MarkerOptions);
    });
  }

  editDetail(): void {
    this.router.navigate(['individuals', this.detailId, 'edit']);
  }

  editPhenophaseDate(phenophaseObservation: PhenophaseObservation): void {
    const dialogRef = this.dialog.open(PhenophaseDialogComponent, {
      width: '615px',
      data: {
        phenophase: phenophaseObservation.phenophase,
        limits: phenophaseObservation.limits,
        observation: some(phenophaseObservation.observation.getOrElse({} as Observation)),
        availableComments: phenophaseObservation.availableComments
      } as PhenophaseObservation
    });

    dialogRef.afterClosed().subscribe((result: PhenophaseObservation) => {
      if (result) {
        this.detailSubject.pipe(first()).subscribe(detail => {
          result.observation.map(observation => {
            // if this is a new observation the created date is not set
            if (!observation.created) {
              observation.individual = detail.individual;
              observation.individual_id = this.detailId;
              observation.phenophase = result.phenophase.id;
              observation.species = detail.species;
              observation.year = detail.year;
              observation.user = detail.user;
              observation.source = 'globe';
            }

            const observationId = [
              observation.individual,
              observation.year,
              observation.species,
              observation.phenophase
            ].join('_');

            this.observationService
              .upsert(observation, observationId)
              .pipe(first())
              .subscribe(observation => {
                this.updateLastObservation(detail, observation, result.phenophase);
              });
          });
        });
      }
    });
  }

  isOwner(): boolean {
    return this.authService.getUserId() === this.owner;
  }

  private updateLastObservation(individual: Individual, observation: Observation, phenophase: Phenophase): void {
    if (this.lastObservation) {
      const updateIndividual: Individual = {
        ...individual,
        ...{ last_observation_date: this.lastObservation.date, last_phenophase: this.lastObservation.phenophase }
      };

      this.individualCreatorNickname.pipe(first()).subscribe(creator => {
        const activity: Activity = {
          user: individual.user,
          user_nickname: creator,
          date: observation.modified,
          individual: individual.individual,
          individual_id: this.detailId,
          text: phenophase.name_de,
          name: individual.name
        };

        this.activityService.insert(activity);
      });

      this.individualService.upsert(updateIndividual);
    }
  }
}
