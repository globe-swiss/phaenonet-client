import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Observable, combineLatest } from 'rxjs';
import { first, map, startWith, switchMap, tap } from 'rxjs/operators';
import { FormPersistenceService } from '../core/form-persistence.service';
import { NavService } from '../core/nav/nav.service';
import { MapIndividual } from '../individual/individual';
import { MasterdataService } from '../masterdata/masterdata.service';
import { SourceFilterType } from '../masterdata/source-type';
import { Species } from '../masterdata/species';
import { TypeGuard, TypeGuardPipe } from '../shared/type-guard.pipe';
import { LocalService } from './../shared/local.service';
import { IndividualInfoWindowData, MapInfoService, StationInfoWindowData } from './map-info.service';
import { IndividualWithMarkerOpt, MapService } from './map.service';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SensorsBadgeComponent } from '../sensors/sensors-badge.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { ShortdatePipe } from '../shared/shortdate.pipe';

type InfoWindowData = IndividualInfoWindowData | StationInfoWindowData;

const allSpecies = { id: 'ALL', de: 'Alle' } as Species;

@Component({
  templateUrl: './map-overview.component.html',
  styleUrls: ['./map-overview.component.scss'],
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
    TypeGuardPipe
  ]
})
export class MapOverviewComponent implements OnInit, OnDestroy {
  @ViewChild(GoogleMap, { static: false }) googleMap: GoogleMap;
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  // Initial Map values
  mapParams: { center: { lat: number; lng: number }; zoom: number };
  readonly options: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.TERRAIN,
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

  constructor(
    private navService: NavService,
    private mapService: MapService,
    private masterdataService: MasterdataService,
    private formPersistanceService: FormPersistenceService,
    private localService: LocalService,
    private mapInfoService: MapInfoService
  ) {}

  ngOnInit(): void {
    this.navService.setLocation('Karte');

    this.mapParams = this.localService.sessionStorageGetObjectCompressed('mapParams');
    if (!this.mapParams) {
      this.mapParams = { center: { lat: 46.818188, lng: 8.227512 }, zoom: 9 };
    }

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
  }

  ngOnDestroy(): void {
    this.localService.sessionStorageSetObjectCompressed('mapParams', {
      center: this.googleMap.getCenter(),
      zoom: this.googleMap.getZoom()
    });
  }

  getColor(phenophase: string): string | null {
    return this.masterdataService.getColor(phenophase);
  }

  openInfoWindow(marker: MapMarker, individualId: string): void {
    this.markerClicked = marker;
    this.mapInfoService.loadInfo(individualId);
  }

  private initFilters(): void {
    if (!this.formPersistanceService.mapFilter) {
      const selectedYear = new FormControl<number>(Number.NaN);
      this.filter = new FormGroup({
        year: selectedYear,
        datasource: new FormControl<SourceFilterType>(this.datasourceFilterValues[0]),
        species: new FormControl<string>(allSpecies.id)
      });
      this.masterdataService.phenoYear$.pipe(first()).subscribe(year => selectedYear.patchValue(year));
      this.formPersistanceService.mapFilter = this.filter;
    } else {
      this.filter = this.formPersistanceService.mapFilter;
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
}
