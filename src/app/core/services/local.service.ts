import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { compress, decompress } from 'lz-string';
import { environment } from '~/environments/environment';

export type StorageType = 'localStorage' | 'sessionStorage';

@Injectable({ providedIn: 'root' })
export class LocalService {
  private localStorageMsgSent = false;

  localStorageRemove(key: string): void {
    this.storageRemove('localStorage', key);
  }

  localStorageGet(key: string): string | undefined {
    return this.storageGet('localStorage', key);
  }

  localStorageSet(key: string, data: string): void {
    this.storageSet('localStorage', key, data);
  }

  public localStorageGetObjectCompressed<T>(key: string): T | null {
    return this.getObjectCompressed('localStorage', key);
  }

  public localStorageSetObjectCompressed<T>(key: string, obj: T): void {
    this.setObjectCompressed('localStorage', key, obj);
  }

  sessionStorageRemove(key: string): void {
    this.storageRemove('sessionStorage', key);
  }

  sessionStorageGet(key: string): string | undefined {
    return this.storageGet('sessionStorage', key);
  }

  sessionStorageSet(key: string, data: string): void {
    this.storageSet('sessionStorage', key, data);
  }

  public sessionStorageGetObjectCompressed<T>(key: string): T | null {
    return this.getObjectCompressed('sessionStorage', key);
  }

  public sessionStorageSetObjectCompressed<T>(key: string, obj: T): void {
    this.setObjectCompressed('sessionStorage', key, obj);
  }

  storageRemove(storagetype: StorageType, key: string): void {
    if (this.storageAvailable(storagetype)) {
      localStorage.removeItem(key);
    }
  }

  storageGet(storagetype: StorageType, key: string): string | undefined {
    if (this.storageAvailable(storagetype)) {
      return this.getStorage(storagetype).getItem(key);
    } else return undefined;
  }

  storageSet(storagetype: StorageType, key: string, data: string): void {
    if (this.storageAvailable(storagetype)) {
      this.getStorage(storagetype).setItem(key, data);
    } else {
      console.error('Localstorage not available');
      /* istanbul ignore next */
      if (!this.localStorageMsgSent && environment.production) {
        Sentry.captureMessage('Localstorage not available', { level: 'debug' });
        this.localStorageMsgSent = true;
      }
    }
  }

  getStorage(type: StorageType): Storage {
    return window[type];
  }

  storageAvailable(type: StorageType): boolean {
    let storage: Storage;
    try {
      storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        // everything except Firefox
        (e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === 'QuotaExceededError' ||
          // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage &&
        storage.length !== 0
      );
    }
  }

  public setObjectCompressed<T>(storagetype: StorageType, key: string, obj: T): void {
    this.storageSet(storagetype, key, compress(JSON.stringify(obj)));
  }

  public getObjectCompressed<T>(storagetype: StorageType, key: string): T | null {
    const localData = this.storageGet(storagetype, key);
    if (localData) {
      return JSON.parse(decompress(localData)) as T;
    } else {
      return null;
    }
  }
}
