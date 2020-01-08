import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { Router, RouterEvent, NavigationStart, RoutesRecognized, ResolveEnd } from '@angular/router';

@Injectable()
export class NavService {
  private DEFAULT_LOCATION = 'PhaenoNet';
  readonly location: Subject<string> = new Subject();
  private untranslatedLocation: string;
  private params: Object;

  constructor(private translateService: TranslateService, private titleService: Title, routerService: Router) {
    routerService.events.subscribe((event: RouterEvent) => {
      if (event instanceof ResolveEnd && event.urlAfterRedirects != window.location.href) {
        // in case the endpoint of this route does not call setLocation, we use the following default.
        this.location.next(this.DEFAULT_LOCATION);
      }
    });
    translateService.onLangChange.subscribe(() => {
      if (this.untranslatedLocation) {
        this.translate(this.untranslatedLocation, this.params);
      }
    });
  }

  setLocation(untranslatedString: string, params?: Object) {
    this.untranslatedLocation = untranslatedString;
    if (params) {
      this.params = params;
    } else {
      this.params = Object;
    }
    this.translate(untranslatedString, params);
  }

  private translate(untranslatedString: string, params?: Object) {
    this.translateService.get(untranslatedString, params).subscribe(translatedString => {
      this.location.next(translatedString);
      this.titleService.setTitle(translatedString);
    });
  }
}
