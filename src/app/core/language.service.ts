import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Injectable()
export class LanguageService {
  private LOCALSTORAGE_KEY = 'lang';

  constructor(private translateService: TranslateService) {}
  init(): any {
    this.translateService.addLangs(['de-CH', 'fr-CH', 'it-CH', 'en-GB']);
    const currentLang = this.determineCurrentLang();
    this.translateService.setDefaultLang('de-CH');
    this.translateService.use(currentLang);
    moment.locale(currentLang);
  }

  changeLocale(newLocale: string): any {
    const locale = this.parseLang(newLocale);
    if (locale == null) {
      throw new Error('given language is not supported: ' + newLocale);
    }
    moment.locale(locale);
    this.translateService.use(locale);
    localStorage.setItem(this.LOCALSTORAGE_KEY, locale);
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
    const langLower = userLang.toLowerCase();
    if (this.isLang(langLower, 'en')) {
      return 'en-GB';
    } else if (this.isLang(langLower, 'fr')) {
      return 'fr-CH';
    } else if (this.isLang(langLower, 'de')) {
      return 'de-CH';
    } else if (this.isLang(langLower, 'it')) {
      return 'it-CH';
    } else {
      return null;
    }
  }

  private isLang(langLower: string, lang: string): boolean {
    return langLower == lang || langLower.startsWith(lang + '_') || langLower.startsWith(lang + '-');
  }
}
