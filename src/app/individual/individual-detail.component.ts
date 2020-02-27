import { Component, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow } from '@angular/google-maps';
import { IndividualService } from './individual.service';
import { NavService } from '../core/nav/nav.service';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, of, identity } from 'rxjs';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Species } from '../masterdata/species';
import { Habitat } from '../masterdata/habitat';
import { Exposition } from '../masterdata/exposition';
import { Shade } from '../masterdata/shade';
import { Forest } from '../masterdata/forest';
import { Description } from '../masterdata/description';
import { Router, ActivatedRoute } from '@angular/router';
import { Individual } from './individual';
import { BaseDetailComponent } from '../core/base-detail.component';
import { AuthService } from '../auth/auth.service';
import { Irrigation } from '../masterdata/irrigation';
import { Distance } from '../masterdata/distance';
import { User } from '../auth/user';
import { UserService } from '../auth/user.service';
import { map, mergeMap, tap } from 'rxjs/operators';

@Component({
  templateUrl: './individual-detail.component.html',
  styleUrls: ['./individual-detail.component.scss']
})
export class IndividualDetailComponent extends BaseDetailComponent<Individual> implements OnInit {
  center = { lat: 46.818188, lng: 8.227512 };
  zoom = 9;
  options = { mapTypeId: google.maps.MapTypeId.SATELLITE };
  markerOptions = { draggable: true };

  geopos: google.maps.LatLngLiteral = { lat: 46.818188, lng: 8.227512 };

  individualCreatorNickname: Observable<string>;
  species: Observable<Species>;
  description: Observable<Description>;
  exposition: Observable<Exposition>;
  shade: Observable<Shade>;
  habitat: Observable<Habitat>;
  forest: Observable<Forest>;
  distance: Observable<Distance>;
  irrigation: Observable<Irrigation>;

  constructor(
    private navService: NavService,
    private router: Router,
    protected route: ActivatedRoute,
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    private userService: UserService
  ) {
    super(individualService, route);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Objekt');

    this.detailSubject.subscribe(detail => {
      if (detail.geopos) {
        this.geopos = detail.geopos;
        this.center = detail.geopos;
      }

      this.species = this.masterdataService.getSpeciesValue(detail.species);
      this.description = this.masterdataService.getDescriptionValue(detail.description);
      this.exposition = this.masterdataService.getExpositionValue(detail.exposition);
      this.shade = this.masterdataService.getShadeValue(detail.shade);
      this.habitat = this.masterdataService.getHabitatValue(detail.habitat);
      this.forest = this.masterdataService.getForestValue(detail.forest);
      this.distance = this.masterdataService.getDistanceValue(detail.distance);
      this.irrigation = this.masterdataService.getIrrigationValue(detail.watering);

      this.individualCreatorNickname = this.userService.getNickname(detail.user);
    });
  }

  editDetail(): void {
    this.router.navigate(['individuals', this.detailId, 'edit']);
  }
}
