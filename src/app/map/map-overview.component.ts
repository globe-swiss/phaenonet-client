import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { combineLatest, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, share, startWith, switchMap, first } from 'rxjs/operators';
import { formatShortDate } from '../core/formatDate';
import { NavService } from '../core/nav/nav.service';
import { Individual } from '../individual/individual';
import { IndividualService } from '../individual/individual.service';
import { IdLike } from '../masterdata/masterdata-like';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Phenophase } from '../masterdata/phaenophase';
import { SourceType } from '../masterdata/source-type';
import { Species } from '../masterdata/species';
import { AuthService } from './../auth/auth.service';

class GlobeInfoWindowData {
  individual: Individual;
  species: Species;
  phenophase?: Phenophase;
  url: string[];
  imgUrl: Observable<string>;
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
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

  center = { lat: 46.818188, lng: 8.227512 };
  zoom = 9;
  options: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    minZoom: 8
  };
  individualsWithMarkerOpts: Observable<IndividualWithMarkerOpt[]>;
  infoWindowDatas: Observable<GlobeInfoWindowData[]>;

  globeInfoWindowData = new ReplaySubject<GlobeInfoWindowData>(1);
  meteoswissInfoWindowData = new ReplaySubject<MeteoswissInfoWindowData>(1);
  infoWindowType = new ReplaySubject<'globe' | 'meteoswiss'>(1);

  // TODO how to get the avaiable years?
  years = this.masterDataService.availableYears;

  datasources: SourceType[] = ['all', 'globe', 'meteoswiss'];
  species: Subject<Species[]> = new ReplaySubject(1);
  mapFormGroup = new FormGroup({
    year: new FormControl(this.years[0]),
    datasource: new FormControl(this.datasources[0]),
    species: new FormControl(allSpecies.id)
  });

  colorMap = {};

  isLoggedIn: boolean;

  formatShortDate = formatShortDate;

  constructor(
    private navService: NavService,
    private individualService: IndividualService,
    private masterDataService: MasterdataService,
    private authService: AuthService
  ) {
    this.colorMap = masterDataService.colorMap;
  }

  ngOnInit() {
    this.navService.setLocation('Karte');

    this.isLoggedIn = this.authService.isLoggedIn();

    this.masterDataService
      .getSpecies()
      .pipe(map(species => [allSpecies].concat(species)))
      .subscribe(this.species);

    this.individualsWithMarkerOpts = this.mapFormGroup.valueChanges.pipe(
      startWith(this.mapFormGroup.getRawValue()),
      switchMap(form => {
        const year = +form.year;
        const datasource: SourceType = form.datasource;
        const species = form.species;
        return this.individualService.listByYear(year).pipe(
          map(individuals => {
            if (datasource === 'meteoswiss') {
              individuals = individuals.filter(i => i.source === 'meteoswiss');
            } else {
              if (datasource === 'globe') {
                individuals = individuals.filter(i => i.source === 'globe');
              }
              if (species !== allSpecies.id) {
                individuals = individuals.filter(i => i.species === species);
              }
            }

            return individuals;
          })
        );
      }),
      map(individuals => {
        const ret = individuals.map(individual => {
          const icon = this.masterDataService.individualToIcon(individual);
          const markerOptions: google.maps.MarkerOptions = { draggable: false, icon: icon };
          return { individual: individual, markerOptions: markerOptions } as IndividualWithMarkerOpt;
        });
        return ret;
      }),
      share()
    );
  }

  openInfoWindow(marker: MapMarker, pos: google.maps.LatLngLiteral, individual: Individual & IdLike) {
    const baseUrl = individual.source === 'meteoswiss' ? '/stations' : '/individuals';
    const url = { url: [baseUrl, individual.id] };

    if (individual.source === 'meteoswiss') {
      this.meteoswissInfoWindowData.next({ ...{ individual: individual }, ...url } as MeteoswissInfoWindowData);

      this.infoWindowType.next('meteoswiss');
    } else {
      combineLatest([
        this.masterDataService.getSpeciesValue(individual.species),
        this.masterDataService.getPhenophaseValue(individual.species, individual.last_phenophase)
      ])
        .pipe(
          map(([species, phenophase]) => {
            return {
              ...{
                individual: individual,
                species: species,
                phenophase: phenophase,
                imgUrl: this.individualService.getImageUrl(individual, true).pipe(
                  first(),
                  map(u => (u === null ? 'assets/img/pic_placeholder.svg' : u))
                )
              },
              ...url
            } as GlobeInfoWindowData;
          })
        )
        .subscribe(this.globeInfoWindowData);
      this.infoWindowType.next('globe');
    }

    this.infoWindow.open(marker);
  }
}
