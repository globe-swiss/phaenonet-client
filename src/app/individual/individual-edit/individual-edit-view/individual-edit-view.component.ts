import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { some } from 'fp-ts/lib/Option';
import { BehaviorSubject, Observable, ReplaySubject, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AlertService } from 'src/app/messaging/alert.service';
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
export class IndividualEditViewComponent implements OnInit, OnDestroy {
  @Input() individual$: ReplaySubject<Individual>;
  @Input() createNewIndividual: boolean;
  subscriptions = new Subscription();

  fileToUpload: File = null;
  processing$ = new BehaviorSubject(false);

  selectableSpecies$: Observable<Species[]>;

  selectableDescriptions$: Observable<Description[]>;
  selectableExpositions$: Observable<Exposition[]>;
  selectableShades$: Observable<Shade[]>;
  selectableHabitats$: Observable<Habitat[]>;
  selectableForests$: Observable<Forest[]>;
  selectableDistances$: Observable<Distance[]>;
  selectableIrrigations$: Observable<Irrigation[]>;
  geopos$: Observable<google.maps.LatLngLiteral>;

  altitudeInput = new FormControl({ value: '', disabled: true });

  createForm = new FormGroup({
    altitude: this.altitudeInput,
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
    private analytics: AngularFireAnalytics,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.geopos$ = this.geoposService.geopos$;
    this.subscriptions.add(this.geoposService.altitude$.subscribe(altitude => this.altitudeInput.setValue(altitude)));

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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    this.processing$.next(true);
    this.individual$.pipe(first()).subscribe(detail => {
      // merge the detail with the new values from the form
      const individual: Individual = { ...detail, ...this.createForm.value };
      individual.geopos = this.geoposService.getGeoPos();
      individual.altitude = this.geoposService.getAltitude();

      this.individualService.upsert(individual).subscribe(result => {
        if (this.fileToUpload) {
          this.uploadImage(result, this.fileToUpload);
        } else {
          this.router.navigate(['individuals', this.toIndividualId(result)]);
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
      .then(() => this.router.navigate(['individuals', this.toIndividualId(individual)]))
      .catch(() => {
        this.alertService.errorMessage(
          'Fehlerhaftes Foto',
          'Das Foto konnte nicht hochgeladen werden. Das Format wird nicht unterstützt oder die maximale Grösse wurde überschritten.',
          some(10000)
        );
        this.router.navigate(['individuals', this.toIndividualId(individual)]);
      });
    this.analytics.logEvent('individual.upload-image');
  }

  removeUploadedFile() {
    this.fileToUpload = null;
  }

  private toIndividualId(individual: Individual): string {
    return individual.year + '_' + individual.individual;
  }
}
