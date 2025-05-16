import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
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
      const loader = new Loader({
        apiKey: environment.firebaseConfig.apiKey,
        version: 'quarterly'
      });

      this.loadPromise = Promise.all([
        loader.importLibrary('core'),
        loader.importLibrary('maps'),
        loader.importLibrary('marker'),
        loader.importLibrary('elevation')
      ]).then(() => {
        this.apiLoaded = true;
      });
    }

    return this.loadPromise;
  }
}
