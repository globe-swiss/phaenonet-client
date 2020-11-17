import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, Subject, of, interval } from 'rxjs';

/**
 * Delay rendering of router-outlet until the google maps api is loaded.
 * Mitigating problems with Safari 14 when loading the page with cached
 * resources.
 */
@Injectable()
export class LoadingGuard implements CanActivate {
  constructor() {}

  testLoaded(): boolean {
    console.log('test loading');

    try {
      const test = google.maps.LatLng;
      console.log('test loading -> true');
      return true;
    } catch (error) {
      console.log('test loading -> false');
      return false;
    }
  }

  public canActivate(): Observable<boolean> {
    if (this.testLoaded()) {
      return of(true);
    } else {
      const subject = new Subject<boolean>();
      const checker = interval(100).subscribe(val => {
        console.log('Check ' + val);

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
