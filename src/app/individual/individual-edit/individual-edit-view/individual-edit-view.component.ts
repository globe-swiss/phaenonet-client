import { Component, Input, OnDestroy, OnInit, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { Storage, ref, uploadBytes } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { some } from 'fp-ts/lib/Option';
import { BehaviorSubject, Observable, ReplaySubject, Subscription, combineLatest } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AlertService } from 'src/app/messaging/alert.service';
import { UserService } from 'src/app/profile/user.service';
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
import { GeoposService } from '../../individual-header/geopos.service';
import { IndividualService } from '../../individual.service';

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
    private analytics: AngularFireAnalytics,
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
    if (this.createNewIndividual) {
      void this.analytics.logEvent('individual-create.submit');
    } else {
      void this.analytics.logEvent('individual-modify.submit');
    }
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
    void this.analytics.logEvent('individual.upload-image');
  }

  removeUploadedFile(): void {
    this.fileToUpload = null;
  }

  private toIndividualId(individual: Individual): string {
    return `${individual.year}_${individual.individual}`;
  }
}
