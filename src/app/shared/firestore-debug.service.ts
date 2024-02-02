import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular-ivy';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirestoreDebugService {
  private readcnt: Map<string, number> = new Map();
  private writecnt: Map<string, number> = new Map();
  private lastSentrySend = 1;

  public addRead(key: string, amt = 1): void {
    this.count(this.readcnt, 'read', key, amt);
  }

  public addWrite(key: string, amt = 1): void {
    this.count(this.writecnt, 'write', key, amt);
  }

  private count(map: Map<string, number>, type: string, key: string, amt: number) {
    if (environment.debugFirestore) {
      const oldcnt = map.get(key) || 0;
      map.set(key, oldcnt + amt);
      if (!environment.production) {
        console.log(`${type}: ${key} -> ${oldcnt + amt} (+${amt})`);
      }

      if (environment.sentryEnabled && oldcnt / 1000 > this.lastSentrySend) {
        Sentry.captureMessage('High Firestore access', {
          level: 'debug',
          extra: { counters: this.map2obj(map) }
        });
        this.lastSentrySend += 1;
      }
    }
  }

  private map2obj(map: Map<string, number>) {
    return Array.from(map).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  }

  public show(): void {
    console.log(this.readcnt);
    console.log(this.writecnt);
  }
}
