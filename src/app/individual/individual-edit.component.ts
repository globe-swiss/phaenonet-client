import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';

@Component({
  templateUrl: './individual-edit.component.html',
  styleUrls: ['./individual-edit.component.scss']
})
export class IndividualEditComponent extends BaseDetailComponent<Individual> implements OnInit {
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

  elevator = new google.maps.ElevationService();

  center: google.maps.LatLngLiteral = { lat: 46.818188, lng: 8.227512 };
  zoom = 9;
  options: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.HYBRID,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false
  };
  markerOptions: google.maps.MarkerOptions = {
    draggable: true,
    icon: { url: '/assets/img/map_pins/map_pin_generic.png', scaledSize: new google.maps.Size(55, 60) }
  };

  geopos: google.maps.LatLngLiteral = this.center;
  altitude: number = 0;

  fileToUpload: File = null;
  fileToUploadBase64 = null;

  imageUrl: Observable<string>;

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
    description: new FormControl(''),
    exposition: new FormControl(''),
    gradient: new FormControl(0, [Validators.min(0), Validators.max(100)]),
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
    private masterdataService: MasterdataService,
    private afStorage: AngularFireStorage
  ) {
    super(individualService, route);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.navService.setLocation('Objekt');

    window.scrollTo(0, 0);

    this.selectableSpecies = this.masterdataService.getSelectableSpecies();
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
      } else {
        this.updateAltitude(new google.maps.LatLng(this.geopos));
      }

      if (detail.image_urls) {
        this.imageUrl = this.afStorage.ref(detail.image_urls[0]).getDownloadURL();
      }

      if (!detail.gradient) {
        detail.gradient = 0;
      }

      if (!detail.type) {
        detail.type = 'individual';
      }

      this.createForm.reset(detail);
    });
  }

  updateGeopos(event: google.maps.MouseEvent): void {
    this.geopos = event.latLng.toJSON();
    this.updateAltitude(event.latLng);
  }

  private updateAltitude(latLng: google.maps.LatLng) {
    this.elevator.getElevationForLocations({ locations: [latLng] }, (results, status) => {
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
      const individual: Individual = { ...detail, ...this.createForm.value, ...{ source: 'globe' } };
      individual.geopos = this.geopos;
      individual.altitude = this.altitude;

      this.individualService.upsert(individual).subscribe(result => {
        if (this.fileToUpload) {
          this.uploadImage(result, this.fileToUpload);
        } else {
          this.router.navigate(['individuals', this.toIndividualId(result)]);
        }
      });
    });
  }

  onFileSelected(files: FileList) {
    this.updateUploadedImagePreview(files);

    this.fileToUpload = files.item(0);
  }

  updateUploadedImagePreview(files: FileList) {
    const readerBase64 = new FileReader();

    readerBase64.onload = () => {
      this.fileToUploadBase64 = readerBase64.result;
    };

    readerBase64.readAsDataURL(files.item(0));
  }

  private uploadImage(individual: Individual, file: File) {
    const extension = file.type.substring(file.type.lastIndexOf('/') + 1, file.type.length);
    const path = '/images/objects/foto_' + individual.individual + '_obj.' + extension;
    const ref = this.afStorage.ref(path);
    const task = ref.put(file);

    task.snapshotChanges().pipe(
      finalize(() => {
        // update the individual with the resulting url
        ref.getDownloadURL().subscribe(downloadUrl => {
          this.individualService.addImageUrl(this.toIndividualId(individual), downloadUrl);
          this.router.navigate(['individuals', this.toIndividualId(individual)]);
        });
      })
    );
  }

  private toIndividualId(individual: Individual): string {
    return individual.year + '_' + individual.individual;
  }
}
