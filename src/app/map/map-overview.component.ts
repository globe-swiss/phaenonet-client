import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { first, map, share, startWith, switchMap } from 'rxjs/operators';
import { FormPersistenceService } from '../core/form-persistence.service';
import { NavService } from '../core/nav/nav.service';
import { Individual } from '../individual/individual';
import { IndividualService } from '../individual/individual.service';
import { MaybeIdLike } from '../masterdata/masterdata-like';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Phenophase } from '../masterdata/phaenophase';
import { SourceFilterType, SourceType } from '../masterdata/source-type';
import { Species } from '../masterdata/species';
import { formatShortDate } from '../shared/formatDate';

class GlobeInfoWindowData {
  individual: Individual;
  species: Species;
  phenophase?: Phenophase;
  url: string[];
  imgUrl$: Observable<string>;
}

class MeteoswissInfoWindowData {
  individual: Individual;
  url: string[];
}

class IndividualWithMarkerOpt {
  individual: Individual;
  markerOptions: google.maps.MarkerOptions;
}

const allSpecies = { id: 'ALL', de: 'Alle' } as Species;

@Component({
  templateUrl: './map-overview.component.html',
  styleUrls: ['./map-overview.component.scss']
})
export class MapOverviewComponent implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  center = { lat: 46.818188, lng: 8.227512 };
  zoom = 9;
  options: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    minZoom: 8
  };
  individualsWithMarkerOpts$: Observable<IndividualWithMarkerOpt[]>;
  infoWindowDatas$: Observable<GlobeInfoWindowData[]>;

  globeInfoWindowData$ = new ReplaySubject<GlobeInfoWindowData>(1);
  meteoswissInfoWindowData$ = new ReplaySubject<MeteoswissInfoWindowData>(1);
  infoWindowType$ = new ReplaySubject<SourceType>(1);

  years$: Observable<number[]> = this.masterdataService.availableYears$;
  species$: Observable<Species[]>;
  datasources: SourceFilterType[] = ['all', 'globe', 'meteoswiss', 'ranger'];

  selectedYear: AbstractControl;
  filter: FormGroup;

  formatShortDate = formatShortDate;

  constructor(
    private navService: NavService,
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    private formPersistanceService: FormPersistenceService,
    private analytics: AngularFireAnalytics
  ) {}

  getColor(phenophase: string): string | null {
    return this.masterdataService.getColor(phenophase);
  }

  ngOnInit(): void {
    this.navService.setLocation('Karte');

    if (!this.formPersistanceService.mapFilter) {
      this.selectedYear = new FormControl();
      this.filter = new FormGroup({
        year: this.selectedYear,
        datasource: new FormControl(this.datasources[0]),
        species: new FormControl(allSpecies.id)
      });
      this.masterdataService.phenoYear$.pipe(first()).subscribe(year => this.selectedYear.patchValue(year));
      this.formPersistanceService.mapFilter = this.filter;
    } else {
      this.filter = this.formPersistanceService.mapFilter;
      this.selectedYear = this.formPersistanceService.mapFilter.controls.year;
    }

    this.species$ = this.masterdataService.getSpecies().pipe(
      map(species => this.masterdataService.sortTranslatedMasterData(species)),
      map(species => [allSpecies].concat(species))
    );

    this.individualsWithMarkerOpts$ = this.filter.valueChanges.pipe(
      startWith(this.filter.getRawValue()),
      switchMap(form => {
        const year = +form.year;
        const datasource = form.datasource as SourceFilterType;
        const species = form.species as string;

        // only report an event if filter is not the default
        if (year !== this.masterdataService.getPhenoYear() || datasource !== 'all' || species !== 'ALL') {
          void this.analytics.logEvent('map.filter', {
            year: year,
            source: datasource,
            species: species,
            current: year === this.masterdataService.getPhenoYear()
          });
        }
        return this.individualService.listByYear(year).pipe(
          map(individuals => {
            if (datasource !== 'all') {
              individuals = individuals.filter(i => i.source === datasource);
            }
            if (species !== allSpecies.id) {
              individuals = individuals.filter(i => {
                return (i.station_species && i.station_species.indexOf(species) !== -1) || species === i.species;
              });
            }

            return individuals;
          })
        );
      }),
      map(individuals => {
        const ret = individuals.map(individual => {
          const icon = this.masterdataService.individualToIcon(individual);
          const markerOptions: google.maps.MarkerOptions = { draggable: false, icon: icon };
          return { individual: individual, markerOptions: markerOptions } as IndividualWithMarkerOpt;
        });
        return ret;
      }),
      share()
    );

    void this.analytics.logEvent('map.view');
  }

  openInfoWindow(marker: MapMarker, pos: google.maps.LatLngLiteral, individual: Individual & MaybeIdLike): void {
    const baseUrl = individual.source === 'meteoswiss' ? '/stations' : '/individuals';
    const url = { url: [baseUrl, individual.id] };

    if (individual.source === 'meteoswiss') {
      this.meteoswissInfoWindowData$.next({ ...{ individual: individual }, ...url } as MeteoswissInfoWindowData);

      this.infoWindowType$.next('meteoswiss');
    } else {
      combineLatest([
        this.masterdataService.getSpeciesValue(individual.species),
        this.masterdataService.getPhenophaseValue(individual.species, individual.last_phenophase)
      ])
        .pipe(
          first(),
          map(([species, phenophase]) => {
            return {
              ...{
                individual: individual,
                species: species,
                phenophase: phenophase,
                imgUrl$: this.individualService.getImageUrl(individual, true).pipe(
                  first(),
                  map(u => (u === null ? 'assets/img/pic_placeholder.svg' : u))
                )
              },
              ...url
            } as GlobeInfoWindowData;
          })
        )
        .subscribe(i => this.globeInfoWindowData$.next(i));
      this.infoWindowType$.next('globe');
    }

    this.infoWindow.open(marker);

    void this.analytics.logEvent('map.click-pin', {
      id: individual.id,
      individual: individual.individual,
      year: individual.year,
      source: individual.source
    });
  }
}
