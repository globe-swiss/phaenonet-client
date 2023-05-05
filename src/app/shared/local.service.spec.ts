import { LocalService } from './local.service';

describe('Service: Local', () => {
  const KEY = 'test_key';
  const VALUE = 'test_value';
  let fixture: LocalService;

  beforeEach(() => {
    fixture = new LocalService();
  });

  it('should create', () => {
    expect(fixture).toBeTruthy();
  });

  describe('localStorageRemove', () => {
    it('should handle write storage when unavailable', () => {
      jest.spyOn(console, 'error').mockReturnValue();
      jest.spyOn(fixture, 'storageAvailable').mockReturnValue(false);
      const localStorageSpy = jest.spyOn(localStorage, 'removeItem');

      fixture.localStorageRemove(KEY);

      expect(localStorageSpy).not.toHaveBeenCalled();
    });

    it('should handle write on storage available', () => {
      jest.spyOn(fixture, 'storageAvailable').mockReturnValue(true);
      const localStorageSpy = jest.spyOn(localStorage, 'removeItem');

      fixture.localStorageRemove(KEY);

      expect(localStorageSpy).toHaveBeenCalledWith(KEY);
    });
  });

  describe('localStorageSet', () => {
    it('should handle write storage when unavailable', () => {
      jest.spyOn(console, 'error').mockReturnValue();
      jest.spyOn(fixture, 'storageAvailable').mockReturnValue(false);
      const localStorageSpy = jest.spyOn(localStorage, 'setItem');

      fixture.localStorageSet(KEY, VALUE);

      expect(localStorageSpy).not.toHaveBeenCalled();
    });

    it('should handle write on storage available', () => {
      jest.spyOn(fixture, 'storageAvailable').mockReturnValue(true);
      const localStorageSpy = jest.spyOn(localStorage, 'setItem');

      fixture.localStorageSet(KEY, VALUE);

      expect(localStorageSpy).toHaveBeenCalledWith(KEY, VALUE);
    });
  });

  describe('localStorageGet', () => {
    it('should handle read storage unavailable', () => {
      jest.spyOn(fixture, 'storageAvailable').mockReturnValue(false);
      const localStorageSpy = jest.spyOn(localStorage, 'getItem');

      const result = fixture.localStorageGet(KEY);

      expect(result).toBeUndefined();
      expect(localStorageSpy).not.toHaveBeenCalled();
    });

    it('should handle read on storage available', () => {
      jest.spyOn(fixture, 'storageAvailable').mockReturnValue(true);
      const localStorageSpy = jest.spyOn(localStorage, 'getItem');
      localStorage.setItem(KEY, VALUE);

      const result = fixture.localStorageGet(KEY);

      expect(result).toEqual(VALUE);
      expect(localStorageSpy).toHaveBeenCalledWith(KEY);
    });
  });

  describe('storageAvailable', () => {
    // eslint-disable-next-line jest/no-commented-out-tests
    // it.skip('should handle localStorage unavailabe', () => {
    //   window.localStorage = undefined; // how to set localstore to undefined?

    //   const result = fixture.storageAvailable('localStorage');

    //   expect(result).toEqual(false);
    // });

    it('should handle localStorage write error', () => {
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('cannot write');
      });

      const result = fixture.storageAvailable('localStorage');

      expect(result).toEqual(false);
    });

    it('should detect that storage is avaiable', () => {
      const result = fixture.storageAvailable('localStorage');

      expect(result).toEqual(true);
    });
  });

  describe('localstorage*ObjectCompressed', () => {
    it('should set/get object', () => {
      const key = 'test';
      const obj = { foo: 'bar' };

      fixture.localStorageSetObjectCompressed(key, obj);
      const result = fixture.localStorageGetObjectCompressed(key);

      expect(result).toEqual(obj);
    });

    it('should gracefully return null on missing key', () => {
      const result = fixture.localStorageGetObjectCompressed('not-found');
      expect(result).toBeNull();
    });
  });
});
