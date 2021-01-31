import { switchMap } from 'rxjs/operators';
import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable()
export class NavService implements OnDestroy {
  private DEFAULT_LOCATION = 'PhaenoNet';
  private location$: BehaviorSubject<string> = new BehaviorSubject(this.DEFAULT_LOCATION);
  private subscriptions = new Subscription();

  constructor(private translateService: TranslateService, private titleService: Title) {
    this.subscriptions.add(
      this.location$
        .pipe(switchMap(untranslatedLocation => translateService.get(untranslatedLocation)))
        .subscribe(translatedLocation => this.titleService.setTitle(translatedLocation))
    );

    this.subscriptions.add(
      translateService.onLangChange.subscribe(() => this.location$.next(this.location$.getValue()))
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  setLocation(untranslatedString: string) {
    this.location$.next(untranslatedString);
  }
}
