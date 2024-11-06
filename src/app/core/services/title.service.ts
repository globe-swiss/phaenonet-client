import { Injectable, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TitleService implements OnDestroy {
  private DEFAULT_LOCATION = 'PhaenoNet';
  private location$: BehaviorSubject<string> = new BehaviorSubject(this.DEFAULT_LOCATION);
  private subscriptions = new Subscription();

  constructor(
    translateService: TranslateService,
    private title: Title
  ) {
    this.subscriptions.add(
      this.location$
        .pipe(switchMap(untranslatedLocation => translateService.get(untranslatedLocation)))
        .subscribe(translatedLocation => this.title.setTitle(translatedLocation))
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
