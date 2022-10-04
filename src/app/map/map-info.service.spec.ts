/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Timestamp } from '@angular/fire/firestore';
import { firstValueFrom, Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { anything, capture, instance, mock, spy, verify, when } from 'ts-mockito';
import { Individual } from '../individual/individual';
import { IndividualService } from '../individual/individual.service';
import { IdLike } from '../masterdata/masterdata-like';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Phenophase } from '../masterdata/phaenophase';
import { Species } from '../masterdata/species';
import { MapInfoService } from './map-info.service';

describe('Service: MapInfo', () => {
  let individualServiceMock: IndividualService;
  let masterdataServiceMock: MasterdataService;
  let fixture: MapInfoService;
  let fixtureSpy: MapInfoService;

  const INDIVIDUAL = {
    id: 'individual_id',
    type: 'individual',
    name: 'individual_name',
    source: 'wld',
    last_observation_date: new Timestamp(0, 0)
  } as Individual & IdLike;
  const STATION = { id: 'station_id', type: 'station', name: 'station_name', source: 'ranger' } as Individual & IdLike;
  const SPECIES = { de: 'species_name' } as Species;
  const PHENOPHASE = { de: 'phenophase_name' } as Phenophase;

  beforeEach(() => {
    individualServiceMock = mock(IndividualService);
    masterdataServiceMock = mock(MasterdataService);
    fixture = new MapInfoService(instance(individualServiceMock), instance(masterdataServiceMock));
    fixtureSpy = spy(fixture);
  });

  it('should create mapInfo service', () => {
    expect(fixture).toBeDefined();
    expect(fixture.infoWindowData$).toBeInstanceOf(Observable);
    expect(fixture['individualIdSubject']).toBeInstanceOf(ReplaySubject);
  });

  describe('loadInfo', () => {
    beforeEach(() => {
      when(individualServiceMock.getWithId(INDIVIDUAL.id)).thenReturn(of(INDIVIDUAL));
      when(individualServiceMock.getWithId(STATION.id)).thenReturn(of(STATION));
      when(fixtureSpy['getStationInfo'](anything())).thenReturn(of(true) as any);
      when(fixtureSpy['getIndividualInfo'](anything())).thenReturn(of(true) as any);
    });
    it('should publish an individual', async () => {
      fixture.loadInfo(INDIVIDUAL.id);
      const result = await firstValueFrom(fixture.infoWindowData$);

      verify(individualServiceMock.getWithId(INDIVIDUAL.id)).once();
      verify(fixtureSpy['getIndividualInfo'](INDIVIDUAL)).once();
      verify(fixtureSpy['getStationInfo'](anything())).never();

      expect(result).toBeTruthy(); // matching mock if getIndividualInfo
    });

    it('should publish a station', async () => {
      fixture.loadInfo(STATION.id);
      const result = await firstValueFrom(fixture.infoWindowData$);

      verify(individualServiceMock.getWithId(STATION.id)).once();
      verify(fixtureSpy['getIndividualInfo'](INDIVIDUAL)).never();
      verify(fixtureSpy['getStationInfo'](anything())).once();

      expect(result).toBeTruthy(); // matching mock if getStationInfo
    });
  });

  describe('getIndividualInfo', () => {
    beforeEach(() => {
      when(masterdataServiceMock.getSpeciesValue(anything())).thenReturn(of(SPECIES));
      when(masterdataServiceMock.getPhenophaseValue(anything(), anything())).thenReturn(of(PHENOPHASE));
      when(individualServiceMock.getImageUrl(anything(), anything())).thenReturn(of('__some_url__'));
    });

    it('should return individuals values mapped', async () => {
      const result = await firstValueFrom(fixture['getIndividualInfo'](INDIVIDUAL));
      const routingUrlArg = capture(fixtureSpy['getRoutingUrl']).first()[0];
      const getImageUrlArgs = capture(individualServiceMock.getImageUrl).first();

      expect(result).toBeDefined();
      expect(result.type).toEqual(INDIVIDUAL.type);
      expect(result.individual_name).toEqual(INDIVIDUAL.name);
      expect(result.last_observation_date).toEqual(new Timestamp(0, 0));
      expect(result.species_name).toEqual(SPECIES.de);
      expect(result.phenophase_name).toEqual(PHENOPHASE.de);

      verify(fixtureSpy['getRoutingUrl'](anything())).once();
      expect(routingUrlArg).toEqual(INDIVIDUAL);
      expect(result.url).toBeDefined();

      expect(getImageUrlArgs[0]).toEqual(INDIVIDUAL);
      expect(getImageUrlArgs[1]).toBeTruthy();
    });

    it('should return image', async () => {
      when(individualServiceMock.getImageUrl(anything(), anything())).thenReturn(of('foo'));

      const result = await firstValueFrom(
        fixture['getIndividualInfo'](INDIVIDUAL).pipe(switchMap(result => result.imgUrl$))
      );
      expect(result).toEqual('foo');
    });

    it('should return placeholder image', async () => {
      when(individualServiceMock.getImageUrl(anything(), anything())).thenReturn(of(null));

      const result = await firstValueFrom(
        fixture['getIndividualInfo'](INDIVIDUAL).pipe(switchMap(result => result.imgUrl$))
      );
      expect(result).toEqual('assets/img/pic_placeholder.svg');
    });

    it('should throw exception on unexpected type', () => {
      expect(() => fixture['getIndividualInfo'](STATION)).toThrow(Error);
    });
  });

  describe('getStationInfo', () => {
    it('should return StationInfoWindowData', async () => {
      const result = await firstValueFrom(fixture['getStationInfo'](STATION));
      const routingUrlArg = capture(fixtureSpy['getRoutingUrl']).first()[0];

      verify(fixtureSpy['getRoutingUrl'](anything())).once();
      expect(routingUrlArg).toEqual(STATION);

      expect(result).toBeDefined();
      expect(result.type).toEqual(STATION.type);
      expect(result.individual_name).toEqual(STATION.name);
      expect(result.source).toEqual(STATION.source);
      expect(result.url).toBeTruthy();
    });

    it('should throw exception on unexpected type', () => {
      expect(() => fixture['getStationInfo'](INDIVIDUAL)).toThrow(Error);
    });
  });

  describe('getRoutingUrl', () => {
    it('should return individual url', () => {
      const result = fixture['getRoutingUrl'](INDIVIDUAL);

      expect(result).toEqual(['/individuals', INDIVIDUAL.id]);
    });

    it('should return station url', () => {
      const result = fixture['getRoutingUrl'](STATION);

      expect(result).toEqual(['/stations', STATION.id]);
    });
  });
});
