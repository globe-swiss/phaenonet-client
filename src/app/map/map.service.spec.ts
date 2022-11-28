/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { initialize } from '@googlemaps/jest-mocks';
import { firstValueFrom, of } from 'rxjs';
import { anyString, anything, capture, instance, mock, spy, verify, when } from 'ts-mockito';
import { MapIndividual } from '../individual/individual';
import { MasterdataService } from '../masterdata/masterdata.service';
import { FirestoreDebugService } from '../shared/firestore-debug.service';
import { MapService } from './map.service';

describe('MapService', () => {
  let afsMock: AngularFirestore;
  let fdsMock: FirestoreDebugService;
  let masterdataServiceMock: MasterdataService;
  let fixture: MapService;
  let fixtureSpy: MapService;

  beforeEach(() => {
    initialize();
    afsMock = mock(AngularFirestore);
    fdsMock = mock(FirestoreDebugService);
    masterdataServiceMock = mock(MasterdataService);
    fixture = new MapService(instance(afsMock), instance(fdsMock), instance(masterdataServiceMock));
    fixtureSpy = spy(fixture);
  });

  it('should create map service', () => {
    expect(fixture).toBeDefined();
  });

  describe('getMapIndividuals', () => {
    const g = { lat: 1, lng: 2 } as google.maps.LatLngLiteral;
    const mapData = {
      data: {
        id1: { g: g, so: 'wld', sp: 'sp', ss: ['ss'], p: 'p', t: 'station' },
        id2: { g: g, so: 'wld', sp: 'sp', ss: ['ss'], p: 'p', t: 'individual' }
      }
    };

    beforeEach(() => {
      const collectionMock = mock(AngularFirestoreCollection);
      const docMock = mock(AngularFirestoreDocument);

      when(afsMock.collection('maps')).thenReturn(instance(collectionMock));
      when(collectionMock.doc(anyString())).thenReturn(instance(docMock));
      when(docMock.valueChanges()).thenReturn(of(mapData));
    });

    it('should add return MapIndividual array', async () => {
      const result = await firstValueFrom(fixture.getMapIndividuals(2000));
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toEqual(2);
    });

    it('should call covertIndividuals with MapData', async () => {
      await firstValueFrom(fixture.getMapIndividuals(2000));
      const args = capture(fixtureSpy['convertIndividuals']).first()[0];

      verify(fixtureSpy.convertIndividuals(anything())).once();
      expect(args).toEqual(mapData);
    });

    it('should add reads to fds', async () => {
      await firstValueFrom(fixture.getMapIndividuals(2000));
      const args = capture(fdsMock.addRead).first()[0];

      verify(fdsMock.addRead(anything())).once();
      expect(args).toEqual('maps');
    });
  });

  describe('convertIndividuals', () => {
    it('should convert MapData to MapIndividuals', () => {
      const g = { lat: 1, lng: 2 } as google.maps.LatLngLiteral;
      const mapData = {
        data: {
          id1: { g: g, so: 'wld', sp: 'sp', ss: ['ss'], p: 'p', t: 'station' },
          id2: { g: g, so: 'wld', sp: 'sp', ss: ['ss'], p: 'p', t: 'individual' }
        }
      };

      const result = fixture['convertIndividuals'](mapData as never);

      expect(result).toEqual([
        {
          id: 'id1',
          geopos: { lat: 1, lng: 2 },
          has_sensor: false,
          source: 'wld',
          type: 'station',
          species: 'sp',
          station_species: ['ss'],
          last_phenophase: 'p'
        },
        {
          id: 'id2',
          geopos: { lat: 1, lng: 2 },
          has_sensor: false,
          source: 'wld',
          type: 'individual',
          species: 'sp',
          station_species: ['ss'],
          last_phenophase: 'p'
        }
      ]);
    });
  });

  describe('filterBySource', () => {
    const SOURCE = 'wld';
    const DATA = [{ source: SOURCE }, { source: 'globe' }, { source: SOURCE }] as MapIndividual[];

    it('should return filted data', () => {
      const result = fixture.filterByDatasource(DATA, SOURCE);

      expect(result.length).toEqual(2);
      result.forEach(mapIndividual => expect(mapIndividual.source).toEqual(SOURCE));
    });

    it('should return empty array', () => {
      const result = fixture.filterByDatasource(DATA, 'ranger');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toEqual(0);
    });
  });

  describe('filterBySpecies', () => {
    const SPECIES = 'x';
    const DATA = [
      { species: 'x' },
      { species: 'x' },
      { species: 'y' },
      { station_species: ['x', 'y'] },
      { station_species: ['z', 'x'] },
      { station_species: ['z', 'y'] }
    ] as MapIndividual[];
    it('should filter individual species', () => {
      const result = fixture.filterBySpecies(DATA, SPECIES);

      expect(result.length).toEqual(4);
      result.forEach(mapIndividual =>
        expect(mapIndividual.species == SPECIES || mapIndividual.station_species.includes(SPECIES)).toBeTruthy()
      );
    });
    it('should return empty array', () => {
      const result = fixture.filterBySpecies(DATA, 'xyz');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toEqual(0);
    });
  });

  describe('getMapMarker', () => {
    const ICON = { url: 'foo' } as google.maps.Icon;
    const INDIVIDUAL = { id: 'id', geopos: 'geopos' } as unknown as MapIndividual;
    const DATA = [INDIVIDUAL, INDIVIDUAL];
    beforeEach(() => {
      when(masterdataServiceMock.individualToIcon(INDIVIDUAL)).thenReturn(ICON);
    });
    it('should return markers', () => {
      const result = fixture.getMapMarkers(DATA);

      verify(masterdataServiceMock.individualToIcon(INDIVIDUAL)).twice();
      expect(result.length).toEqual(2);
      result.forEach(i => {
        expect(i.individualId).toEqual('id');
        expect(i.geopos).toEqual('geopos');
        expect(i.markerOptions.draggable).toEqual(false);
        expect(i.markerOptions.icon).toEqual(ICON);
      });
    });

    it('should handle empty array input', () => {
      const result = fixture.getMapMarkers([]);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toEqual(0);
    });
  });
});
