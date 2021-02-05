import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { Description } from '../../../masterdata/description';
import { Distance } from '../../../masterdata/distance';
import { Exposition } from '../../../masterdata/exposition';
import { Forest } from '../../../masterdata/forest';
import { Habitat } from '../../../masterdata/habitat';
import { Irrigation } from '../../../masterdata/irrigation';
import { MasterdataService } from '../../../masterdata/masterdata.service';
import { Shade } from '../../../masterdata/shade';
import { Species } from '../../../masterdata/species';
import { Individual } from '../../individual';
import { IndividualService } from '../../individual.service';
import { GeoposService } from '../individual-edit-header/geopos.service';

@Component({
  selector: 'app-individual-edit-view',
  templateUrl: './individual-edit-view.component.html',
  styleUrls: ['./individual-edit-view.component.scss']
})
export class IndividualEditViewComponent implements OnInit {
  @Input() individual$: ReplaySubject<Individual>;
  @Input() createNewIndividual: boolean;
  fileToUpload: File = null;

  selectableSpecies$: Observable<Species[]>;

  selectableDescriptions$: Observable<Description[]>;
  selectableExpositions$: Observable<Exposition[]>;
  selectableShades$: Observable<Shade[]>;
  selectableHabitats$: Observable<Habitat[]>;
  selectableForests$: Observable<Forest[]>;
  selectableDistances$: Observable<Distance[]>;
  selectableIrrigations$: Observable<Irrigation[]>;
  geopos$: BehaviorSubject<google.maps.LatLngLiteral>;
  altitude$: BehaviorSubject<number>;

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
    private router: Router,
    private afStorage: AngularFireStorage,
    private masterdataService: MasterdataService,
    private individualService: IndividualService,
    private geoposService: GeoposService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit() {
    this.geopos$ = this.geoposService.geopos$;
    this.altitude$ = this.geoposService.altitude$;

    this.selectableSpecies$ = this.masterdataService.getSelectableSpecies();
    this.selectableDescriptions$ = this.masterdataService.getDescriptions();
    this.selectableExpositions$ = this.masterdataService.getExpositions();
    this.selectableShades$ = this.masterdataService.getShades();
    this.selectableHabitats$ = this.masterdataService.getHabitats();
    this.selectableForests$ = this.masterdataService.getForests();
    this.selectableDistances$ = this.masterdataService.getDistances();
    this.selectableIrrigations$ = this.masterdataService.getIrrigations();

    this.individual$.pipe(first()).subscribe(detail => {
      if (this.createNewIndividual) {
        detail.gradient = 0;
        detail.type = 'individual';
        detail.source = 'globe';
      }
      this.createForm.reset(detail);
    });
  }

  onSubmit(): void {
    this.individual$.pipe(first()).subscribe(detail => {
      // merge the detail with the new values from the form
      const individual: Individual = { ...detail, ...this.createForm.value };
      individual.geopos = this.geopos$.value;
      individual.altitude = this.altitude$.value;

      this.individualService.upsert(individual).subscribe(result => {
        if (this.fileToUpload) {
          this.uploadImage(result, this.fileToUpload);
        } else {
          this.router.navigate(['individuals', this.toIndividualId(result)]); // fixme: navigating in this subscription is causing ObjectUnsubscribedError
        }
      });
    });
    if (this.createNewIndividual) {
      this.analytics.logEvent('individual-create.submit');
    } else {
      this.analytics.logEvent('individual-modify.submit');
    }
  }

  onFileSelected(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  private uploadImage(individual: Individual, file: File) {
    const path = this.individualService.getImagePath(individual);
    const ref = this.afStorage.ref(path);
    ref
      .put(file, { contentType: file.type })
      .then(() => this.router.navigate(['individuals', this.toIndividualId(individual)])); // fixme: navigating in this subscription is causing ObjectUnsubscribedError
    this.analytics.logEvent('individual.upload-image');
  }

  removeUploadedFile() {
    this.fileToUpload = null;
  }

  private toIndividualId(individual: Individual): string {
    return individual.year + '_' + individual.individual;
  }
}
