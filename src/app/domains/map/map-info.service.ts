import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MapMarker } from '@angular/google-maps';
import { IdLike } from '@core/core.model';
import { Individual, SensorLiveData } from '@shared/models/individual.model';
import { Phenophase, Species } from '@shared/models/masterdata.model';
import { IndividualService } from '@shared/services/individual.service';
import { MasterdataService } from '@shared/services/masterdata.service';
import { combineLatest, defer, iif, Observable, of, ReplaySubject } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

export interface IndividualInfoWindowData {
  marker: MapMarker;
  type: string;
  individual_name: string;
  hasLiveData: boolean;
  sensor?: SensorLiveData;
  last_observation_date: Timestamp;
  species_name: string;
  phenophase_name: string;
  url: string[];
  imgUrl$: Observable<string>;
}

export interface StationInfoWindowData {
  marker: MapMarker;
  type: string;
  individual_name: string;
  source: string;
  url: string[];
}

@Injectable({ providedIn: 'root' })
export class MapInfoService {
  private individualIdSubject = new ReplaySubject<string>(1);
  public readonly infoWindowData$: Observable<IndividualInfoWindowData | StationInfoWindowData>;

  constructor(
    private individualService: IndividualService,
    private masterdataService: MasterdataService
  ) {
    this.infoWindowData$ = this.individualIdSubject.pipe(
      switchMap(id => this.individualService.getWithId(id)),
      switchMap(individual =>
        iif(
          () => individual.type === 'individual',
          defer(() => this.getIndividualInfo(individual)),
          defer(() => this.getStationInfo(individual))
        )
      )
    );
  }

  /**
   * Loads the data for the information window and exposes it to `infoWindowData$`.
   * @param individualId the individual to load
   *
   */
  public loadInfo(individualId: string) {
    this.individualIdSubject.next(individualId);
  }

  private getIndividualInfo(individual: Individual & IdLike): Observable<IndividualInfoWindowData> {
    if (individual.type === 'individual') {
      return combineLatest([
        this.masterdataService.getSpeciesValue(individual.species),
        this.masterdataService.getPhenophaseValue(individual.species, individual.last_phenophase)
      ]).pipe(map(([species, phenophase]) => this.getIndividualInfoInt(individual, species, phenophase)));
    } else {
      throw new Error(`Unexpected individual type: Expected 'individual', got '${individual.type}'`);
    }
  }

  private getIndividualInfoInt(
    individual: Individual & IdLike,
    species: Species,
    phenophase: Phenophase
  ): IndividualInfoWindowData {
    return {
      type: individual.type,
      individual_name: individual.name,
      last_observation_date: individual.last_observation_date,
      hasLiveData: individual?.deveui?.length > 0 ? true : false,
      sensor: individual?.sensor,
      species_name: species.de,
      phenophase_name: phenophase?.de,
      imgUrl$: this.individualService.getImageUrl(individual, true).pipe(
        first(),
        map(u => (u === null ? 'assets/img/pic_placeholder.svg' : u))
      ),
      url: this.getRoutingUrl(individual)
    } as IndividualInfoWindowData;
  }

  private getStationInfo(individual: Individual & IdLike): Observable<StationInfoWindowData> {
    if (individual.type === 'station') {
      return of({
        type: individual.type,
        individual_name: individual.name,
        source: individual.source,
        url: this.getRoutingUrl(individual)
      } as StationInfoWindowData);
    } else {
      throw new Error(`Unexpected individual type: Expected 'station', got '${individual.type}'`);
    }
  }

  private getRoutingUrl(individual: Individual & IdLike) {
    const baseUrl = individual.type === 'station' ? '/stations' : '/individuals';
    return [baseUrl, individual.id];
  }
}
