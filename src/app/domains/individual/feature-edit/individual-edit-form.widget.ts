import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Storage, ref, uploadBytes } from '@angular/fire/storage';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { Individual } from '@shared/models/individual.model';
import {
  Description,
  Distance,
  Exposition,
  Forest,
  Habitat,
  Irrigation,
  Shade,
  Species
} from '@shared/models/masterdata.model';
import { MasterdataService } from '@shared/models/masterdata.service';
import { UserService } from '@shared/services/user.service';
import { some } from 'fp-ts/lib/Option';
import { BehaviorSubject, Observable, ReplaySubject, Subscription, combineLatest } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { IndividualService } from '../../../shared/services/individual.service';
import { GeoposService } from '../shared/geopos.service';

@Component({
  selector: 'app-individual-edit-view',
  templateUrl: './individual-edit-form.widget.html',
  styleUrls: ['./individual-edit-form.widget.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatSelect,
    MatOption,
    NgFor,
    MatIcon,
    MatSuffix,
    MatButton,
    AsyncPipe,
    TranslateModule
  ]
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

  geopos: Signal<google.maps.LatLngLiteral>;
  altitude: Signal<number>;

  createForm = new FormGroup({
    altitude: new FormControl<number>(0),
    species: new FormControl<string>(''),
    name: new FormControl<string>(''),
    description: new FormControl<string>(''),
    exposition: new FormControl<string>(''),
    gradient: new FormControl<number>(0, [Validators.min(0), Validators.max(100)]),
    shade: new FormControl<string>(''),
    habitat: new FormControl<string>(''),
    forest: new FormControl<string>(''),
    less100: new FormControl<string>(''),
    watering: new FormControl<string>('')
  });

  constructor(
    private router: Router,
    private afStorage: Storage,
    private masterdataService: MasterdataService,
    private individualService: IndividualService,
    private geoposService: GeoposService,
    private alertService: AlertService,
    private userService: UserService
  ) {
    this.geopos = toSignal(this.geoposService.geopos$);
    this.altitude = toSignal(this.geoposService.altitude$);
  }

  ngOnInit(): void {
    this.selectableSpecies$ = this.masterdataService
      .getObservableSpecies(this.userService.roles$)
      .pipe(map(species => this.masterdataService.sortTranslatedMasterData(species)));
    this.selectableDescriptions$ = this.masterdataService.getDescriptions();
    this.selectableExpositions$ = this.masterdataService.getExpositions();
    this.selectableShades$ = this.masterdataService.getShades();
    this.selectableHabitats$ = this.masterdataService.getHabitats();
    this.selectableForests$ = this.masterdataService.getForests();
    this.selectableDistances$ = this.masterdataService.getDistances();
    this.selectableIrrigations$ = this.masterdataService.getIrrigations();

    combineLatest([this.individual$, this.userService.getSource()])
      .pipe(first())
      .subscribe(([individual, source]) => {
        if (this.createNewIndividual) {
          individual.gradient = 0;
          individual.type = 'individual';
          individual.source = source;
        }
        this.createForm.reset(individual);
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    this.processing$.next(true);
    this.individual$.pipe(first()).subscribe(detail => {
      // merge the detail with the new values from the form
      const individual = { ...detail, ...this.createForm.value } as Individual;
      individual.geopos = this.geoposService.getGeoPos();
      individual.altitude = this.geoposService.getAltitude();

      this.individualService.upsert(individual).subscribe(result => {
        if (this.fileToUpload) {
          this.uploadImage(result, this.fileToUpload);
        } else {
          void this.router.navigate(['individuals', this.toIndividualId(result)]);
        }
      });
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    this.fileToUpload = files.item(0);
  }

  private uploadImage(individual: Individual, file: File) {
    const path = this.individualService.getImagePath(individual);
    const storageRef = ref(this.afStorage, path);
    uploadBytes(storageRef, file, { contentType: file.type })
      .then(() => this.router.navigate(['individuals', this.toIndividualId(individual)]))
      .catch(() => {
        this.alertService.errorMessage(
          'Fehlerhaftes Foto',
          'Das Foto konnte nicht hochgeladen werden. Das Format wird nicht unterstützt oder die maximale Grösse wurde überschritten.',
          some(10000)
        );
        void this.router.navigate(['individuals', this.toIndividualId(individual)]);
      });
  }

  removeUploadedFile(): void {
    this.fileToUpload = null;
  }

  private toIndividualId(individual: Individual): string {
    return `${individual.year}_${individual.individual}`;
  }
}
