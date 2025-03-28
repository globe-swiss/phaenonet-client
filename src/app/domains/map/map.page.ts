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
import { TranslateModule } from '@ngx-translate/core';
import { basemaps, MapType } from '@shared/models/basemaps.model';
import { MapIndividual } from '@shared/models/individual.model';
import { Species } from '@shared/models/masterdata.model';
import {
  allTranslatableFilterValue,
  allValue,
  SourceType,
  sourceValues,
  TranslatableFilterType
} from '@shared/models/source-type.model';
import { MasterdataService } from '@shared/services/masterdata.service';
import { ShortdatePipe } from '@shared/utils/shortdate.pipe';
import { TypeGuard, TypeGuardPipe } from '@shared/utils/type-guard.pipe';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { first, map, startWith, switchMap, tap } from 'rxjs/operators';
import { allType } from './../../shared/models/source-type.model';
import { IndividualInfoWindowData, MapInfoService, StationInfoWindowData } from './map-info.service';
import { IndividualWithMarkerOpt, MapService } from './map.service';
import { SensorsBadgeComponent } from './sensors-badge.component';

type InfoWindowData = IndividualInfoWindowData | StationInfoWindowData;

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

  private defaultMapParams = { center: { lat: 46.818188, lng: 8.227512 }, zoom: 9 };
  private defaultBasemapIndex = MapType.TERRAIN;

  // saved parameters
  private basemapIndex: number;
  private mapParams: { center: { lat: number; lng: number }; zoom: number };
  // Initial Map values
  readonly staticOptions: google.maps.MapOptions = {
    mapTypeId: basemaps[MapType.TERRAIN].mapTypeID,
    styles: basemaps[MapType.TERRAIN].styles,
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
    datasource: FormControl<allType | SourceType>;
    species: FormControl<string>;
  }>;
  yearFilterValues$: Observable<number[]>;
  speciesFilterValues$: Observable<TranslatableFilterType[]>;
  readonly datasourceFilterValues = [allValue, ...sourceValues];

  // type guards to enable strict type checking in HTML on infoWindowData$
  isIndividualInfoWindowData: TypeGuard<InfoWindowData, IndividualInfoWindowData> = (
    data: InfoWindowData
  ): data is IndividualInfoWindowData => data?.type === 'individual';
  isStationInfoWindowData: TypeGuard<InfoWindowData, StationInfoWindowData> = (
    data: InfoWindowData
  ): data is StationInfoWindowData => data?.type === 'station';

  private subscriptions = new Subscription();

  constructor(
    private titleService: TitleService,
    private mapService: MapService,
    private masterdataService: MasterdataService,
    private localService: LocalService,
    private mapInfoService: MapInfoService
  ) {}

  ngOnInit(): void {
    this.titleService.setLocation('Karte');

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
      map(species => [allTranslatableFilterValue, ...species])
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
    this.basemapIndex = this.localService.localStorageGetObjectCompressed('basemapIndex') ?? this.defaultBasemapIndex;
    this.mapParams = this.localService.sessionStorageGetObjectCompressed('mapParams') ?? this.defaultMapParams;
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

  closeInfoWindow(): void {
    this.infoWindow.close();
  }

  private initFilters(): void {
    if (!this.mapService.mapFilterState) {
      const selectedYear = new FormControl<number>(Number.NaN);
      this.filter = new FormGroup({
        year: selectedYear,
        datasource: new FormControl<allType | SourceType>(allValue),
        species: new FormControl<string>(allValue)
      });
      this.masterdataService.phenoYear$.pipe(first()).subscribe(year => selectedYear.patchValue(year));
      this.mapService.mapFilterState = this.filter;
    } else {
      this.filter = this.mapService.mapFilterState;
    }
  }

  private filterMapIndividuals(
    individuals: MapIndividual[],
    datasource: allType | SourceType,
    species: string
  ): MapIndividual[] {
    individuals = datasource !== allValue ? this.mapService.filterByDatasource(individuals, datasource) : individuals;
    individuals = species !== allValue ? this.mapService.filterBySpecies(individuals, species) : individuals;
    return individuals;
  }

  private getSelectableSpecies(datasource: allType | SourceType): Observable<Species[]> {
    return this.masterdataService.getSpecies().pipe(
      map(species => {
        if (datasource == allValue) {
          return species;
        } else {
          // set all species if current species filter if invalid
          if (
            this.filter.controls.species.value != allValue &&
            species.filter(s => s.id == this.filter.controls.species.value && s.sources.includes(datasource)).length ==
              0
          ) {
            this.filter.controls.species.setValue(allValue);
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
