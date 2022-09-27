/* tslint:disable:no-unused-variable */

import { initialize } from '@googlemaps/jest-mocks';
import { MapInfoService } from './map-info.service';

describe('Service: MapInfo', () => {
  let fixture: MapInfoService;
  beforeEach(() => {
    initialize();
    fixture = new MapInfoService(null, null);
  });

  it('should ...', () => {
    expect(fixture).toBeTruthy();
  });
});
