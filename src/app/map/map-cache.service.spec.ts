/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Timestamp } from '@angular/fire/firestore';
import { initialize } from '@googlemaps/jest-mocks';
import { firstValueFrom, of } from 'rxjs';
import { Individual } from '../individual/individual';
import { LocalService } from '../shared/local.service';
import { MapCacheService } from './map-cache.service';

describe('MapCacheService', () => {
  let fixture: MapCacheService;
  let afsMock;
  let fdsMock;
  let localServiceMock: LocalService;
  let localService_localStorageGetSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  let loadCacheSpy: jest.SpyInstance;
  let setupChangeListenerSpy: jest.SpyInstance;
  let parseCompressedCacheSpy: jest.SpyInstance;
  let restoreIndividualTimestampSpy: jest.SpyInstance;
  let removeLocalCacheSpy: jest.SpyInstance;

  beforeEach(() => {
    initialize();
    localServiceMock = { localStorageGet: jest.fn(), localStorageRemove: jest.fn() } as unknown as LocalService;

    fixture = new MapCacheService(afsMock, fdsMock, localServiceMock);
    consoleErrorSpy = jest.spyOn(console, 'error');

    localService_localStorageGetSpy = jest.spyOn(localServiceMock, 'localStorageGet');

    loadCacheSpy = jest.spyOn(fixture as any, 'loadCache');
    setupChangeListenerSpy = jest.spyOn(fixture as any, 'setupChangeListener');
    parseCompressedCacheSpy = jest.spyOn(fixture as any, 'parseCompressedCache');
    restoreIndividualTimestampSpy = jest.spyOn(fixture as any, 'restoreIndividualTimestamps');
    removeLocalCacheSpy = jest.spyOn(fixture as any, 'removeLocalCache');
  });

  it('should create MapCacheService', () => {
    expect(fixture).toBeTruthy();
  });

  describe('getIndividuals', () => {
    it('should return individual observable for a year with empty cache', async () => {
      const YEAR = 2000;
      const CACHE_TS = 1000;
      const RESULT_VALUES = [1, 2, 3];

      loadCacheSpy.mockReturnValue({ cacheTs: CACHE_TS, cachedData: [] });
      setupChangeListenerSpy.mockReturnValue(of(RESULT_VALUES));

      const result$ = fixture.getIndividuals(YEAR);

      expect(loadCacheSpy).toBeCalledWith(YEAR);
      expect(setupChangeListenerSpy).toHaveBeenCalledWith(YEAR, CACHE_TS);

      await expect(firstValueFrom(result$)).resolves.toEqual(RESULT_VALUES);
    });

    it('should return current observable if no year is given', async () => {
      const documentListener = of();
      setupChangeListenerSpy.mockReturnValue(documentListener);

      const result$ = fixture.getIndividuals();

      expect(loadCacheSpy).not.toHaveBeenCalled();
      expect(setupChangeListenerSpy).not.toHaveBeenCalled();
      await expect(firstValueFrom(result$)).resolves.toEqual([]);
    });
  });

  describe('loadCache', () => {
    const YEAR = 2000;
    const CACHE_TS = 1234;
    const CACHED_DATA = [
      CACHE_TS,
      [
        { id: 1, created: { seconds: 1, nanoseconds: 0 } },
        { id: 2, created: { seconds: 2, nanoseconds: 9 } }
      ]
    ];

    const EXPECTED_CACHED_DATA = [
      { id: 1, created: new Timestamp(1, 0) },
      { id: 2, created: new Timestamp(2, 0) }
    ];

    it('should return an empty data set if nothing was cached', () => {
      localService_localStorageGetSpy.mockReturnValue(undefined);

      const result = fixture['loadCache'](YEAR);

      expect(result).toEqual({ cacheTs: null, cachedData: [] });
    });

    it('should return cached data', () => {
      localService_localStorageGetSpy.mockReturnValue('compressedLocalData');
      parseCompressedCacheSpy.mockReturnValue(CACHED_DATA);

      const result = fixture['loadCache'](YEAR);

      expect(parseCompressedCacheSpy).toHaveBeenCalledWith('compressedLocalData');
      expect(restoreIndividualTimestampSpy).toHaveBeenCalledWith(CACHED_DATA[1][0]);
      expect(restoreIndividualTimestampSpy).toHaveBeenCalledWith(CACHED_DATA[1][1]);
      expect(removeLocalCacheSpy).not.toHaveBeenCalled(); // error occured

      expect(result.cachedData[0].created).toBeInstanceOf(Timestamp);
      expect(result).toEqual({ cacheTs: CACHE_TS, cachedData: EXPECTED_CACHED_DATA });
    });

    it('should handle error and reset cache', () => {
      consoleErrorSpy.mockImplementation();
      localService_localStorageGetSpy.mockReturnValue('compressedLocalData');
      parseCompressedCacheSpy.mockReturnValue('invalid data');

      fixture['loadCache'](YEAR);

      expect(removeLocalCacheSpy).toHaveBeenCalledWith(YEAR); // error occured
    });
  });

  describe('restoreIndividualTimestamps', () => {
    it('should restore all timestamp objects on an individual', () => {
      const TS = { seconds: 1, nanoseconds: 2 };
      const NAME = 'name';
      const INDIVIDUAL = { name: NAME, created: TS, modified: TS, last_observation_date: TS };

      const result = fixture['restoreIndividualTimestamps'](INDIVIDUAL as Individual);

      expect(result).toBeTruthy();
      expect(result.created).toBeInstanceOf(Timestamp);
      expect(result.modified).toBeInstanceOf(Timestamp);
      expect(result.last_observation_date).toBeInstanceOf(Timestamp);
      expect(result.created.toDate()).toBeInstanceOf(Date);
    });

    it('should ingore missing timestamps', () => {
      const NAME = 'name';
      const INDIVIDUAL = { name: NAME };

      const result = fixture['restoreIndividualTimestamps'](INDIVIDUAL as Individual);

      expect(result).toBeTruthy();
      expect(result.created).toBeUndefined();
      expect(result.modified).toBeUndefined();
      expect(result.last_observation_date).toBeUndefined();
      expect(result.name).toEqual(NAME);
    });

    it('should handle missing nanoseconds', () => {
      const TS = { seconds: 1 };
      const INDIVIDUAL = { created: TS };

      const result = fixture['restoreIndividualTimestamps'](INDIVIDUAL as Individual);

      expect(result).toBeTruthy();
      expect(result.created).toBeInstanceOf(Timestamp);
      expect(result.created.toDate()).toBeInstanceOf(Date);
    });
  });
});
