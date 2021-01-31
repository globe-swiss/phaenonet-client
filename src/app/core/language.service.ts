import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class LanguageService implements OnDestroy {
  private LOCALSTORAGE_KEY = 'lang';
  private subscriptions = new Subscription();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private translateService: TranslateService,
    private authService: AuthService
  ) {
    this.subscriptions.add(
      this.authService
        .getUserObservable()
        .pipe(filter(user => !!user))
        .subscribe(user => this.changeLocale(user.locale))
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  init(): any {
    this.translateService.addLangs(['de-CH', 'fr-CH', 'it-CH']);
    const currentLang = this.determineCurrentLang();
    this.translateService.setDefaultLang('de-CH');
    this.changeLocale(currentLang);
  }

  changeLocale(newLocale: string): any {
    const locale = this.parseLang(newLocale);
    if (locale == null) {
      throw new Error('given language is not supported: ' + newLocale);
    }
    moment.locale(locale);
    this.translateService.use(locale);
    localStorage.setItem(this.LOCALSTORAGE_KEY, locale);
    this.document.documentElement.lang = locale;
  }

  determineCurrentLang(): string {
    let userLang = localStorage.getItem(this.LOCALSTORAGE_KEY);
    if (userLang != null) {
      userLang = this.parseLang(userLang);
    }
    if (userLang == null) {
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
}
