import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MapInfoWindow } from '@angular/google-maps';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BaseDetailComponent } from '../core/base-detail.component';
import { NavService } from '../core/nav/nav.service';
import { Description } from '../masterdata/description';
import { Distance } from '../masterdata/distance';
import { Exposition } from '../masterdata/exposition';
import { Forest } from '../masterdata/forest';
import { Habitat } from '../masterdata/habitat';
import { Irrigation } from '../masterdata/irrigation';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Shade } from '../masterdata/shade';
import { Species } from '../masterdata/species';
import { Individual } from './individual';
import { IndividualService } from './individual.service';

@Component({
  templateUrl: './individual-edit.component.html',
  styleUrls: ['./individual-edit.component.scss']
})
export class IndividualEditComponent extends BaseDetailComponent<Individual> implements OnInit {
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

  elevator = new google.maps.ElevationService();

  center: google.maps.LatLngLiteral = { lat: 46.818188, lng: 8.227512 };
  zoom = 9;
  options = { mapTypeId: google.maps.MapTypeId.SATELLITE };
  markerOptions = { draggable: true };

  geopos: google.maps.LatLngLiteral = this.center;
  altitude: number = 0;

  selectableSpecies: Observable<Species[]>;

  selectableDescriptions: Observable<Description[]>;
  selectableExpositions: Observable<Exposition[]>;
  selectableShades: Observable<Shade[]>;
  selectableHabitats: Observable<Habitat[]>;
  selectableForests: Observable<Forest[]>;
  selectableDistances: Observable<Distance[]>;
  selectableIrrigations: Observable<Irrigation[]>;

  createForm = new FormGroup({
    species: new FormControl(''),
    name: new FormControl(''),
    fotos: new FormControl(''),
    description: new FormControl(''),
    exposition: new FormControl(''),
    shade: new FormControl(''),
    habitat: new FormControl(''),
    forest: new FormControl(''),
    less100: new FormControl(''),
    watering: new FormControl('')
  });

  constructor(
    private navService: NavService,
    private router: Router,
    protected route: ActivatedRoute,
    private individualService: IndividualService,
    private masterdataService: MasterdataService
  ) {
    super(individualService, route);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Objekt');

    this.selectableSpecies = this.masterdataService.getSpecies();
    this.selectableDescriptions = this.masterdataService.getDescriptions();
    this.selectableExpositions = this.masterdataService.getExpositions();
    this.selectableShades = this.masterdataService.getShades();
    this.selectableHabitats = this.masterdataService.getHabitats();
    this.selectableForests = this.masterdataService.getForests();
    this.selectableDistances = this.masterdataService.getDistances();
    this.selectableIrrigations = this.masterdataService.getIrrigations();

    this.detailSubject.subscribe(detail => {
      if (detail.geopos) {
        this.geopos = detail.geopos;
        this.center = detail.geopos;
        this.altitude = detail.altitude;
      }
      this.createForm.reset(detail);
    });
  }

  updateGeopos(event: google.maps.MouseEvent): void {
    this.geopos = event.latLng.toJSON();
    this.elevator.getElevationForLocations({ locations: [event.latLng] }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          this.altitude = results[0].elevation;
        }
      }
    });
  }

  onSubmit(): void {
    this.detailSubject.subscribe(detail => {
      // merge the detail with the new values from the form
      const individual: Individual = { ...detail, ...this.createForm.value };
      individual.geopos = this.geopos;
      individual.altitude = this.altitude;

      this.individualService.upsert(individual, this.detailId).subscribe(result => {
        this.router.navigate(['individuals', result.year + '_' + result.individual]);
      });
    });
  }
}
