import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import { FormControl, FormGroup } from '@angular/forms';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { combineLatest, Observable, ReplaySubject, Subject } from 'rxjs';
import { first, map, share, startWith, switchMap, tap } from 'rxjs/operators';
import { formatShortDate } from '../shared/formatDate';
import { NavService } from '../core/nav/nav.service';
import { Individual } from '../individual/individual';
import { IndividualService } from '../individual/individual.service';
import { IdLike } from '../masterdata/masterdata-like';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Phenophase } from '../masterdata/phaenophase';
import { SourceFilterType, SourceType } from '../masterdata/source-type';
import { Species } from '../masterdata/species';

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

  years$ = this.masterdataService.availableYears$.pipe(tap(years => this.selectedYear.patchValue(years[0])));
  species$: Subject<Species[]> = new ReplaySubject(1);
  datasources: SourceFilterType[] = ['all', 'globe', 'meteoswiss', 'ranger'];

  selectedYear = new FormControl();
  mapFormGroup = new FormGroup({
    year: this.selectedYear,
    datasource: new FormControl(this.datasources[0]),
    species: new FormControl(allSpecies.id)
  });

  formatShortDate = formatShortDate;

  constructor(
    private navService: NavService,
    private individualService: IndividualService,
    private masterdataService: MasterdataService,
    private analytics: AngularFireAnalytics
  ) {}

  getColor(phenophase: string): string | null {
    return this.masterdataService.getColor(phenophase);
  }

  ngOnInit() {
    this.navService.setLocation('Karte');

    this.masterdataService
      .getSpecies()
      .pipe(map(species => [allSpecies].concat(species)))
      .subscribe(this.species$);

    this.individualsWithMarkerOpts$ = this.mapFormGroup.valueChanges.pipe(
      startWith(this.mapFormGroup.getRawValue()),
      switchMap(form => {
        const year = +form.year;
        const datasource: SourceFilterType = form.datasource;
        const species = form.species;

        // only report an event if filter is not the default
        if (year !== this.masterdataService.getPhenoYear() || datasource !== 'all' || species !== 'ALL') {
          this.analytics.logEvent('map.filter', {
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

    this.analytics.logEvent('map.view');
  }

  openInfoWindow(marker: MapMarker, pos: google.maps.LatLngLiteral, individual: Individual & IdLike) {
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

    this.analytics.logEvent('map.click-pin', {
      id: individual.id,
      individual: individual.individual,
      year: individual.year,
      source: individual.source
    });
  }
}
