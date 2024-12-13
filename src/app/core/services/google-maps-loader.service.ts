import { Injectable } from '@angular/core';
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
      this.loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.firebaseConfig.apiKey}`;
        script.async = true;
        script.onload = async () => {
          try {
            await this.initLibraries();
            this.apiLoaded = true;

            resolve();
          } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            reject(new Error('Google Maps API failed to load: ' + (error?.message || error)));
          }
        };
        script.onerror = () => reject(new Error('Google Maps API failed to load.'));
        document.head.appendChild(script);
      });
    }

    return this.loadPromise;
  }

  private async initLibraries(): Promise<void> {
    await google.maps.importLibrary('core');
    await google.maps.importLibrary('maps');
    await google.maps.importLibrary('marker');
    await google.maps.importLibrary('elevation');
  }
}
