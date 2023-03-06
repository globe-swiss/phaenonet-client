import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { compress, decompress } from 'lz-string';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalService {
  private LOCALSTORAGE = 'localStorage';
  private localStorageMsgSent = false;

  localStorageRemove(key: string): void {
    if (this.storageAvailable(this.LOCALSTORAGE)) {
      localStorage.removeItem(key);
    }
  }

  localStorageGet(key: string): string | undefined {
    if (this.storageAvailable(this.LOCALSTORAGE)) {
      return localStorage.getItem(key);
    } else return undefined;
  }

  localStorageSet(key: string, data: string): void {
    if (this.storageAvailable(this.LOCALSTORAGE)) {
      localStorage.setItem(key, data);
    } else {
      console.error('Localstorage not available');
      /* istanbul ignore next */
      if (!this.localStorageMsgSent && environment.production) {
        Sentry.captureMessage('Localstorage not available', { level: 'debug' });
        this.localStorageMsgSent = true;
      }
    }
  }

  storageAvailable(type: string) {
    let storage: Storage;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

  public localstoreSetObjectCompressed<T>(key: string, obj: T): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.localStorageSet(key, compress(JSON.stringify(obj)));
  }

  public localstoraGetObjectCompressed<T>(key: string): T | null {
    const localData = this.localStorageGet(key);
    if (localData) {
      return JSON.parse(decompress(localData)) as T;
    } else {
      return null;
    }
  }
}
