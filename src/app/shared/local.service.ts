import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalService {
  private localStorageMsgSent = false;

  localStorageGet(key: string): string | undefined {
    if (this.storageAvailable('localStorage')) {
      return localStorage.getItem(key);
    } else return undefined;
  }

  localStorageSet(key: string, data: string): boolean {
    if (this.storageAvailable('localStorage')) {
      localStorage.setItem(key, data);
      return true;
    } else {
      console.error('Localstorage not available');
      /* istanbul ignore next */
      if (!this.localStorageMsgSent && environment.production) {
        Sentry.captureMessage('Localstorage not available', { level: Sentry.Severity.Debug });
        this.localStorageMsgSent = true;
      }
      return false;
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
}
