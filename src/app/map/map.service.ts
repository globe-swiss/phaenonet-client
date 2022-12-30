import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { IndividualType, MapIndividual } from '../individual/individual';
import { IdLike } from '../masterdata/masterdata-like';
import { MasterdataService } from '../masterdata/masterdata.service';
import { SourceFilterType, SourceType } from '../masterdata/source-type';
import { FirestoreDebugService } from '../shared/firestore-debug.service';

interface MapData {
  data: {
    [individual_id: string]: {
      g: google.maps.LatLngLiteral;
      so: SourceType;
      sp?: string;
      ss?: string[];
      p?: string;
      t: IndividualType;
    };
  };
}

export interface IndividualWithMarkerOpt {
  individualId: string;
  geopos: google.maps.LatLngLiteral;
  markerOptions: google.maps.MarkerOptions;
}

@Injectable()
export class MapService {
  constructor(
    protected afs: AngularFirestore,
    protected fds: FirestoreDebugService,
    private masterdataService: MasterdataService
  ) {}

  getMapIndividuals(year: number): Observable<MapIndividual[]> {
    return this.afs
      .collection('maps')
      .doc<MapData>(year.toString())
      .valueChanges()
      .pipe(
        first(), // do not subscribe to changes
        map(x => this.convertIndividuals(x)),
        tap(() => this.fds.addRead('maps'))
      );
  }

  public convertIndividuals(mapData: MapData): MapIndividual[] {
    const result = Array<MapIndividual & IdLike>();
    Object.entries(mapData.data).forEach(([k, v]) => {
      // omit individuals without phenophase
      if (!(v.t == 'individual' && !v.p)) {
        result.push({
          id: k,
          geopos: v.g,
          source: v.so,
          type: v.t,
          species: v.sp,
          station_species: v.ss,
          last_phenophase: v.p
        });
      }
    });
    return result;
  }

  public filterByDatasource(individuals: MapIndividual[], datasource: SourceFilterType): MapIndividual[] {
    return individuals.filter(i => i.source === datasource);
  }

  public filterBySpecies(individuals: MapIndividual[], species: string): MapIndividual[] {
    return individuals.filter(i => {
      return (i.station_species && i.station_species.indexOf(species) !== -1) || species === i.species;
    });
  }

  public getMapMarkers(individuals: MapIndividual[]): IndividualWithMarkerOpt[] {
    return individuals.map(individual => {
      const icon = this.masterdataService.individualToIcon(individual);
      const markerOptions: google.maps.MarkerOptions = { draggable: false, icon: icon };
      return {
        individualId: individual.id,
        geopos: individual.geopos,
        markerOptions: markerOptions
      } as IndividualWithMarkerOpt;
    });
  }
}
