import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { LocalService } from '../shared/local.service';

@Injectable()
export class LanguageService implements OnDestroy {
  private LOCALSTORAGE_KEY = 'lang';
  private subscriptions = new Subscription();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private translateService: TranslateService,
    // private userService: UserService,
    private localService: LocalService
  ) {
    // this.subscriptions.add(
    //   this.userService.user$.pipe(filter(user => !!user)).subscribe(user => this.changeLocale(user.locale))
    // ); / TODO check if this needs to be reimplmented
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  init(): void {
    this.translateService.addLangs(['de-CH', 'fr-CH', 'it-CH']);
    const currentLang = this.determineCurrentLang();
    this.translateService.setDefaultLang('de-CH');
    this.changeLocale(currentLang);
  }

  changeLocale(newLocale: string): void {
    let locale = this.parseLang(newLocale);
    if (locale == null) {
      locale = 'de-CH';
    }
    moment.locale(locale);
    this.translateService.use(locale);
    this.localService.localStorageSet(this.LOCALSTORAGE_KEY, locale);
    this.document.documentElement.lang = locale;
  }

  determineCurrentLang(): string {
    let userLang = this.localService.localStorageGet(this.LOCALSTORAGE_KEY);
    if (userLang != null) {
      userLang = this.parseLang(userLang);
    }
    if (userLang == null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      userLang = this.parseLang(navigator.language || ((navigator as any).userLanguage as string));
    }
    if (userLang != null) {
      return userLang;
    } else {
      return 'de-CH';
    }
  }

  private parseLang(userLang: string): string | null {
    if (userLang) {
      const langLower = userLang.toLowerCase();
      if (this.isLang(langLower, 'fr')) {
        return 'fr-CH';
      } else if (this.isLang(langLower, 'de')) {
        return 'de-CH';
      } else if (this.isLang(langLower, 'it')) {
        return 'it-CH';
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  private isLang(langLower: string, lang: string): boolean {
    return langLower === lang || langLower.startsWith(lang + '_') || langLower.startsWith(lang + '-');
  }

  public sortTranslated(a: string, b: string): number {
    return (this.translateService.instant(a) as string).localeCompare(this.translateService.instant(b));
  }
}
