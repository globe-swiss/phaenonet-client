import { Injectable } from '@angular/core';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { environment } from '~/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private apiLoaded = false;
  private loadPromise: Promise<void> | null = null;

  load(): Promise<void> {
    if (this.apiLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise === null) {
      setOptions({
        key: environment.firebaseConfig.apiKey,
        v: 'quarterly'
      });

      this.loadPromise = Promise.all([
        importLibrary('core'),
        importLibrary('maps'),
        importLibrary('marker'),
        importLibrary('elevation')
      ]).then(() => {
        this.apiLoaded = true;
      });
    }

    return this.loadPromise;
  }
}
