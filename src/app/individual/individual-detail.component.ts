import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { findFirst } from 'fp-ts/lib/Array';
import { combineLatest, Observable } from 'rxjs';
import { first, map, find, share, shareReplay } from 'rxjs/operators';
import { UserService } from '../auth/user.service';
import { BaseDetailComponent } from '../core/base-detail.component';
import { NavService } from '../core/nav/nav.service';
import { Description } from '../masterdata/description';
import { Distance } from '../masterdata/distance';
import { Exposition } from '../masterdata/exposition';
import { Forest } from '../masterdata/forest';
import { Habitat } from '../masterdata/habitat';
import { Irrigation } from '../masterdata/irrigation';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Phenophase } from '../masterdata/phaenophase';
import { Shade } from '../masterdata/shade';
import { Species } from '../masterdata/species';
import { Observation } from '../observation/observation';
import { ObservationService } from '../observation/observation.service';
import { PhenophaseObservation } from '../observation/phenophase-observation';
import { Individual } from './individual';
import { IndividualService } from './individual.service';
import { PhenophaseDialogComponent } from './phenophase-dialog.component';
import { some } from 'fp-ts/lib/Option';
import { AuthService } from '../auth/auth.service';
import { PhenophaseGroup } from '../masterdata/phaenophase-group';
import { PhenophaseObservationsGroup } from '../observation/phenophase-observations-group';
import { User } from '../auth/user';
import { Activity } from '../activity/activity';
import { ActivityService } from '../activity/activity.service';

@Component({
  templateUrl: './individual-detail.component.html',
  styleUrls: ['./individual-detail.component.scss']
})
export class IndividualDetailComponent extends BaseDetailComponent<Individual> implements OnInit {
  center = { lat: 46.818188, lng: 8.227512 };
  zoom = 9;
  options: google.maps.MapOptions = { mapTypeId: google.maps.MapTypeId.HYBRID, streetViewControl: false };
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    icon: { url: '/assets/img/map_pins/map_pin_1.svg', scaledSize: new google.maps.Size(60, 60) }
  };

  geopos: google.maps.LatLngLiteral = { lat: 46.818188, lng: 8.227512 };

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

  lastPhenophase: Observable<Phenophase>;

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
  individualObservations: Observable<Observation[]>;
  phenophaseObservationsGroups: Observable<PhenophaseObservationsGroup[]>;
  lastObservation: Observation;

  owner: string;

  currentUser: Observable<User>;
  isFollowing: Observable<boolean>;

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
    private authService: AuthService
  ) {
    super(individualService, route);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Objekt');

    this.currentUser = this.authService.getUserObservable();

    this.detailSubject.subscribe(detail => {
      if (detail.geopos) {
        this.geopos = detail.geopos;
        this.center = detail.geopos;
      }

      this.isFollowing = this.currentUser.pipe(
        map(u => u.following_individuals.find(id => id === detail.individual) !== undefined)
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

      this.individualCreatorNickname = this.userService.getNickname(detail.user).pipe(shareReplay());

      this.availablePhenophases = this.masterdataService.getPhenophases(detail.species);
      this.availablePhenophaseGroups = this.masterdataService.getPhenophaseGroups(detail.species);
      this.individualObservations = this.observationService.listByIndividual(this.detailId);

      this.lastPhenophase = this.availablePhenophases.pipe(
        map(phenophases => {
          return phenophases.find(p => p.id === detail.last_phenophase);
        })
      );

      // combine the available phenophases with the existing observations
      this.phenophaseObservationsGroups = combineLatest(
        this.availablePhenophaseGroups,
        this.availablePhenophases,
        this.individualObservations,
        (phenophaseGroups, phenophases, observations) => {
          this.lastObservation = observations.sort((o1, o2) => o1.date.getTime() - o2.date.getTime())[
            observations.length - 1
          ];

          return phenophaseGroups.map(phenophaseGroup => {
            return {
              phenophaseGroup: phenophaseGroup,
              phenophaseObservations: phenophases
                .filter(p => p.group_id === phenophaseGroup.id)
                .map(p => {
                  return {
                    phenophase: p,
                    observation: findFirst((o: Observation) => o.phenophase === p.id)(observations)
                  };
                })
            };
          });
        }
      );
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
        observation: some(phenophaseObservation.observation.getOrElse({} as Observation))
      }
    });

    dialogRef.afterClosed().subscribe((result: PhenophaseObservation) => {
      if (result) {
        this.detailSubject.pipe(first()).subscribe(detail => {
          result.observation.map(observation => {
            // if this is a new observation only the date is known
            if (!observation.created) {
              observation.created = new Date();
              observation.individual = detail.individual;
              observation.individual_id = this.detailId;
              observation.phenophase = result.phenophase.id;
              observation.species = detail.species;
              observation.year = detail.year;
              observation.user = detail.user;
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

  follow(): void {
    this.individualToFollow().subscribe(f => this.userService.followIndividual(f));
  }

  unfollow(): void {
    this.individualToFollow().subscribe(f => this.userService.unfollowIndividual(f));
  }

  private individualToFollow(): Observable<string> {
    return this.detailSubject.pipe(
      first(),
      map(i => i.individual)
    );
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
          date: observation.created,
          individual: individual.individual,
          individual_id: this.detailId,
          text: phenophase.name_de,
          name: individual.name
        };

        this.activityService.insert(activity);
      });

      this.individualService.upsert(updateIndividual, this.detailId);
    }
  }
}
