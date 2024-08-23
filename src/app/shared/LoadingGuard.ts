import { Injectable } from '@angular/core';

import { interval, Observable, of, Subject } from 'rxjs';

/**
 * Delay rendering of router-outlet until the google maps api is loaded.
 * Mitigating problems with Safari 14 when loading the page with cached
 * resources.
 */
@Injectable({ providedIn: 'root' })
export class LoadingGuard {
  testLoaded(): boolean {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const test = google.maps.LatLng;
      return true;
    } catch (error) {
      return false;
    }
  }

  public canActivate(): Observable<boolean> {
    if (this.testLoaded()) {
      return of(true);
    } else {
      const subject = new Subject<boolean>();
      const checker = interval(100).subscribe(val => {
        if (this.testLoaded()) {
          subject.next(true);
          subject.complete();
          checker.unsubscribe();
        }
        if (val > 100) {
          subject.next(false);
          subject.complete();
          checker.unsubscribe();
        }
      });
      return subject;
    }
  }
}
