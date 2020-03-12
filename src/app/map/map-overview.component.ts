import { Component, OnInit, ViewChild } from '@angular/core';
import { NavService } from '../core/nav/nav.service';
import { Observable, combineLatest, ReplaySubject, Subject, of } from 'rxjs';
import { map, share, switchMap, startWith } from 'rxjs/operators';
import { IndividualService } from '../individual/individual.service';
import { Individual } from '../individual/individual';
import { MapMarker, MapInfoWindow } from '@angular/google-maps';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Species } from '../masterdata/species';
import { Phenophase } from '../masterdata/phaenophase';
import { IdLike } from '../masterdata/masterdata-like';
import { FormControl, FormGroup } from '@angular/forms';

class GlobeInfoWindowData {
  individual: Individual;
  species: Species;
  phenophase?: Phenophase;
  url: string[];
}

class MeteoswissInfoWindowData {
  individual: Individual;
  url: string[];
}

class IndividualWithMarkerOpt {
  individual: Individual;
  markerOptions: google.maps.MarkerOptions;
}

const allSpecies = { id: 'ALL', de: 'All' } as Species;

@Component({
  templateUrl: './map-overview.component.html',
  styleUrls: ['./map-overview.component.scss']
})
export class MapOverviewComponent implements OnInit {
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

  center = { lat: 46.818188, lng: 8.227512 };
  zoom = 9;
  options: google.maps.MapOptions = { mapTypeId: google.maps.MapTypeId.HYBRID, streetViewControl: false };
  individualsWithMarkerOpts: Observable<IndividualWithMarkerOpt[]>;
  infoWindowDatas: Observable<GlobeInfoWindowData[]>;

  globeInfoWindowData = new ReplaySubject<GlobeInfoWindowData>(1);
  meteoswissInfoWindowData = new ReplaySubject<MeteoswissInfoWindowData>(1);
  infoWindowType = new ReplaySubject<'globe' | 'meteoswiss'>(1);

  // TODO how to get the avaiable years?
  years = [2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011];
  datasources = ['ALL', 'Globe', 'Meteoswiss'];
  species: Subject<Species[]> = new ReplaySubject(1);
  mapFormGroup = new FormGroup({
    year: new FormControl(this.years[0]),
    datasource: new FormControl(this.datasources[0]),
    species: new FormControl(allSpecies.id)
  });

  // temporary solution
  colorMap = {
    KNS: '#4b9f6f',
    KNV: '#4b9f6f',
    BEA: '#7bb53b',
    BES: '#7bb53b',
    BLA: '#e8d439',
    BLB: '#e8d439',
    BLE: '#e8d439',
    FRA: '#e8b658',
    FRB: '#e8b658',
    BVA: '#b29976',
    BVS: '#b29976',
    BFA: '#000000'
  };
  phenophaseIndex = {
    KNS: 1,
    KNV: 1,
    BEA: 2,
    BES: 2,
    BLA: 3,
    BLB: 3,
    BLE: 3,
    FRA: 4,
    FRB: 4,
    BVA: 5,
    BVS: 5,
    BFA: 6
  };

  constructor(
    private navService: NavService,
    private individualService: IndividualService,
    private msterDataService: MasterdataService
  ) {}

  ngOnInit() {
    this.navService.setLocation('Karte');
    this.msterDataService
      .getSpecies()
      .pipe(map(species => [allSpecies].concat(species)))
      .subscribe(this.species);
    this.individualsWithMarkerOpts = this.mapFormGroup.valueChanges.pipe(
      startWith(this.mapFormGroup.getRawValue()),
      switchMap(form => {
        const year = +form.year;
        const datasource = form.datasource;
        const species = form.species;
        return this.individualService.listByYear(year).pipe(
          map(individuals => {
            if (datasource === 'Meteoswiss') {
              individuals = individuals.filter(i => i.source === 'meteoswiss');
            } else {
              if (datasource === 'Globe') {
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
          let phaenoIndex = 1;
          if (individual.last_phenophase) {
            phaenoIndex = this.phenophaseIndex[individual.last_phenophase];
          }
          let icon: google.maps.Icon;
          if (individual.source === 'meteoswiss') {
            icon = {
              url: '/assets/img/map_pins/map_pin_meteoschweiz.png',
              scaledSize: new google.maps.Size(60, 60)
            };
          } else {
            icon = {
              url: '/assets/img/map_pins/map_pin_' + individual.species.toLowerCase() + '_' + phaenoIndex + '.png',
              scaledSize: new google.maps.Size(55, 60)
            };
          }
          const markerOptions: google.maps.MarkerOptions = { draggable: false, icon: icon };
          return { individual: individual, markerOptions: markerOptions } as IndividualWithMarkerOpt;
        });
        return ret;
      }),
      share()
    );
  }

  openInfoWindow(marker: MapMarker, pos: google.maps.LatLngLiteral, individual: Individual & IdLike) {
    const url = { url: ['/individuals', individual.id] };

    if (individual.source === 'meteoswiss') {
      this.meteoswissInfoWindowData.next({ ...{ individual: individual }, ...url } as MeteoswissInfoWindowData);

      this.infoWindowType.next('meteoswiss');
    } else {
      combineLatest([
        this.msterDataService.getSpeciesValue(individual.species),
        this.msterDataService.getPhenophaseValue(individual.species, individual.last_phenophase)
      ])
        .pipe(
          map(([species, phenophase]) => {
            return {
              ...{
                individual: individual,
                species: species,
                phenophase: phenophase
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
