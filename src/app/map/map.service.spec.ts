/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { initialize } from '@googlemaps/jest-mocks';
import { MapIndividual } from '../individual/individual';
import { MapService } from './map.service';

describe('MapService', () => {
  let fixture: MapService;
  let afsMock;
  let fdsMock;
  let masterDataServiceMock;

  beforeEach(() => {
    initialize();
    fixture = new MapService(afsMock, fdsMock, masterDataServiceMock);
  });

  it('should create MapCacheService', () => {
    expect(fixture).toBeTruthy();
  });

  describe('getMapIndividuals', () => {});

  describe('convertIndividuals', () => {
    it('should convert MapData to MapIndividuals', () => {
      const g = { lat: 1, lng: 2 } as google.maps.LatLngLiteral;
      const mapData = {
        data: {
          id1: { g: g, so: 'wld', sp: 'sp', ss: ['ss'], p: 'p', t: 'station' },
          id2: { g: g, so: 'wld', sp: 'sp', ss: ['ss'], p: 'p', t: 'individual' }
        }
      };

      const result = fixture['convertIndividuals'](mapData as any);

      expect(result).toEqual([
        new MapIndividual('id1', { lat: 1, lng: 2 }, 'wld', 'station', 'sp', ['ss'], 'p'),
        new MapIndividual('id2', { lat: 1, lng: 2 }, 'wld', 'individual', 'sp', ['ss'], 'p')
      ]);
    });
  });
});
