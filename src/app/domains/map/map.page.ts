import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { LocalService } from '@core/services/local.service';
import { TitleService } from '@core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MapIndividual } from '@shared/models/individual.model';
import { Species } from '@shared/models/masterdata.model';
import { SourceFilterType } from '@shared/models/source-type.model';
import { MasterdataService } from '@shared/services/masterdata.service';
import { ShortdatePipe } from '@shared/utils/shortdate.pipe';
import { TypeGuard, TypeGuardPipe } from '@shared/utils/type-guard.pipe';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { first, map, startWith, switchMap, tap } from 'rxjs/operators';
import { IndividualInfoWindowData, MapInfoService, StationInfoWindowData } from './map-info.service';
import { basemaps, defaultBasemap as defaultBasemapIndex, defaultMapParams } from './map.model';
import { IndividualWithMarkerOpt, MapService } from './map.service';
import { SensorsBadgeComponent } from './sensors-badge.component';

type InfoWindowData = IndividualInfoWindowData | StationInfoWindowData;

const allSpecies = { id: 'ALL', de: 'Alle' } as Species;

@Component({
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [
    GoogleMap,
    NgFor,
    MapMarker,
    MapInfoWindow,
    NgIf,
    RouterLink,
    SensorsBadgeComponent,
    MatIcon,
    MatButton,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    AsyncPipe,
    TranslateModule,
    ShortdatePipe,
    TypeGuardPipe,
    MatFabButton
  ]
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(GoogleMap, { static: false }) googleMap: GoogleMap;
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  // saved parameters
  private basemapIndex: number;
  private mapParams: { center: { lat: number; lng: number }; zoom: number };
  // Initial Map values
  readonly staticOptions: google.maps.MapOptions = {
    mapTypeId: basemaps[0].mapTypeID,
    styles: basemaps[0].styles,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    minZoom: 8
  };

  // map marker and info window observables
  mapMarkers$: Observable<IndividualWithMarkerOpt[]>;
  infoWindowData$: Observable<IndividualInfoWindowData | StationInfoWindowData>;
  private markerClicked: MapMarker; // last marker clicked

  // filter from and value lists
  filter: FormGroup<{
    year: FormControl<number>;
    datasource: FormControl<SourceFilterType>;
    species: FormControl<string>;
  }>;
  yearFilterValues$: Observable<number[]>;
  speciesFilterValues$: Observable<Species[]>;
  readonly datasourceFilterValues: SourceFilterType[] = ['all', 'globe', 'meteoswiss', 'ranger', 'wld'];

  // type guards to enable strict type checking in HTML on infoWindowData$
  isIndividualInfoWindowData: TypeGuard<InfoWindowData, IndividualInfoWindowData> = (
    data: InfoWindowData
  ): data is IndividualInfoWindowData => data?.type === 'individual';
  isStationInfoWindowData: TypeGuard<InfoWindowData, StationInfoWindowData> = (
    data: InfoWindowData
  ): data is StationInfoWindowData => data?.type === 'station';

  private subscriptions = new Subscription();
  translationsLoaded = false;

  constructor(
    private titleService: TitleService,
    private mapService: MapService,
    private masterdataService: MasterdataService,
    private localService: LocalService,
    private mapInfoService: MapInfoService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.titleService.setLocation('Karte');

    // workaround hitting issue with standalone components: https://github.com/angular/components/issues/17839
    this.subscriptions.add(
      this.translateService.get(this.datasourceFilterValues[0]).subscribe(() => {
        this.translationsLoaded = true;
      })
    );

    // open info window on the last marker that was clicked when new data is available
    this.infoWindowData$ = this.mapInfoService.infoWindowData$.pipe(
      tap(() => this.infoWindow.open(this.markerClicked))
    );

    this.initFilters();

    this.yearFilterValues$ = this.masterdataService.availableYears$;
    this.speciesFilterValues$ = this.filter.controls.datasource.valueChanges.pipe(
      startWith(''),
      switchMap(() => this.getSelectableSpecies(this.filter.controls.datasource.value)),
      map(species => this.masterdataService.sortTranslatedMasterData(species)),
      map(species => [allSpecies].concat(species))
    );

    // load map values once per year and filter on the result
    this.mapMarkers$ = combineLatest([
      this.filter.controls.year.valueChanges.pipe(
        // start with an value to trigger loading of data
        startWith(this.filter.controls.year.value),
        switchMap(year => this.mapService.getMapIndividuals(year))
      ),
      this.filter.controls.datasource.valueChanges.pipe(startWith(this.filter.controls.datasource.value)),
      this.filter.controls.species.valueChanges.pipe(startWith(this.filter.controls.species.value))
    ]).pipe(
      map(([individuals, datasourceFilterValue, speciesFilterValue]) =>
        this.filterMapIndividuals(individuals, datasourceFilterValue, speciesFilterValue)
      ),
      map(individuals => this.mapService.getMapMarkers(individuals))
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    window.addEventListener('beforeunload', this.saveState.bind(this));
  }

  ngAfterViewInit(): void {
    this.basemapIndex = this.localService.localStorageGetObjectCompressed('basemapIndex') ?? defaultBasemapIndex;
    this.mapParams = this.localService.sessionStorageGetObjectCompressed('mapParams') ?? defaultMapParams;
    this.googleMap.googleMap.setOptions({ center: this.mapParams.center, zoom: this.mapParams.zoom });
    this.setBasemap(this.basemapIndex);
  }

  ngOnDestroy(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    window.removeEventListener('beforeunload', this.saveState.bind(this));
    this.subscriptions.unsubscribe();
    this.saveState();
  }

  private saveState() {
    this.localService.sessionStorageSetObjectCompressed('mapParams', {
      center: this.googleMap.getCenter(),
      zoom: this.googleMap.getZoom()
    });
    this.localService.localStorageSetObjectCompressed('basemapIndex', this.basemapIndex);
  }

  getColor(phenophase: string): string | null {
    return this.masterdataService.getColor(phenophase);
  }

  openInfoWindow(marker: MapMarker, individualId: string): void {
    this.markerClicked = marker;
    this.mapInfoService.loadInfo(individualId);
  }

  private initFilters(): void {
    if (!this.mapService.mapFilterState) {
      const selectedYear = new FormControl<number>(Number.NaN);
      this.filter = new FormGroup({
        year: selectedYear,
        datasource: new FormControl<SourceFilterType>(this.datasourceFilterValues[0]),
        species: new FormControl<string>(allSpecies.id)
      });
      this.masterdataService.phenoYear$.pipe(first()).subscribe(year => selectedYear.patchValue(year));
      this.mapService.mapFilterState = this.filter;
    } else {
      this.filter = this.mapService.mapFilterState;
    }
  }

  private filterMapIndividuals(
    individuals: MapIndividual[],
    datasource: SourceFilterType,
    species: string
  ): MapIndividual[] {
    individuals = datasource !== 'all' ? this.mapService.filterByDatasource(individuals, datasource) : individuals;
    individuals = species !== allSpecies.id ? this.mapService.filterBySpecies(individuals, species) : individuals;
    return individuals;
  }

  private getSelectableSpecies(datasource: SourceFilterType): Observable<Species[]> {
    return this.masterdataService.getSpecies().pipe(
      map(species => {
        if (datasource == 'all') {
          return species;
        } else {
          // set all species if current species filter if invalid
          if (
            this.filter.controls.species.value != allSpecies.id &&
            species.filter(s => s.id == this.filter.controls.species.value && s.sources.includes(datasource)).length ==
              0
          ) {
            this.filter.controls.species.setValue(allSpecies.id);
          }
          return species.filter(s => s.sources.includes(datasource));
        }
      })
    );
  }

  switchView() {
    this.basemapIndex = (this.basemapIndex + 1) % basemaps.length;
    this.setBasemap(this.basemapIndex);
  }

  private setBasemap(index: number) {
    this.googleMap.googleMap.setOptions({ mapTypeId: basemaps[index].mapTypeID });
    this.googleMap.googleMap.setOptions({ styles: basemaps[index].styles });
  }
}
