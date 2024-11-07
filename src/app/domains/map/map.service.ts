import { Injectable } from '@angular/core';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { IdLike } from '@core/core.model';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { IndividualType, MapIndividual } from '@shared/models/individual.model';
import { MasterdataService } from '@shared/models/masterdata.service';
import { SourceFilterType, SourceType } from '@shared/models/source-type.model';
import { Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

interface MapData {
  data: {
    [individual_id: string]: {
      g: google.maps.LatLngLiteral;
      so: SourceType;
      sp?: string;
      ss?: string[];
      p?: string;
      hs?: boolean;
      t: IndividualType;
    };
  };
}

export interface IndividualWithMarkerOpt {
  individualId: string;
  geopos: google.maps.LatLngLiteral;
  markerOptions: google.maps.MarkerOptions;
}

@Injectable({ providedIn: 'root' })

// requires to be provided in root to save awhen leaving the component
export class MapService {
  public mapFilterState: FormGroup<{
    year: FormControl<number>;
    datasource: FormControl<SourceFilterType>;
    species: FormControl<string>;
  }>;

  constructor(
    protected afs: Firestore,
    protected fds: FirestoreDebugService,
    private masterdataService: MasterdataService
  ) {}

  getMapIndividuals(year: number): Observable<MapIndividual[]> {
    return docData(doc(this.afs, 'maps', year.toString())).pipe(
      first(), // do not subscribe to changes
      map((mapData: MapData) => this.convertIndividuals(mapData)),
      map(mapIndividuals => this.filterMapIndividuals(mapIndividuals)),
      tap(() => this.fds.addRead('maps'))
    );
  }

  filterMapIndividuals(mapIndividuals: MapIndividual[]): MapIndividual[] {
    return mapIndividuals.filter(mapIndividual => mapIndividual.last_phenophase || mapIndividual.station_species);
  }

  public convertIndividuals(mapData: MapData): MapIndividual[] {
    const result = Array<MapIndividual & IdLike>();
    Object.entries(mapData.data).forEach(([k, v]) => {
      result.push({
        id: k,
        geopos: v.g,
        source: v.so,
        type: v.t,
        species: v.sp,
        station_species: v.ss,
        last_phenophase: v.p,
        has_sensor: v.hs ?? false
      });
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
      const markerOptions: google.maps.MarkerOptions = {
        draggable: false,
        icon: icon
      };
      return {
        individualId: individual.id,
        geopos: individual.geopos,
        markerOptions: markerOptions
      } as IndividualWithMarkerOpt;
    });
  }
}
