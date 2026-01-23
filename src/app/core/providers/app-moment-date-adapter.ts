import { Inject, inject, Injectable, Optional } from '@angular/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MatMomentDateAdapterOptions,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { LanguageService } from '@core/services/language.service';
import { MomentDatetimeAdapter } from '@mat-datetimepicker/moment';
import moment, { Moment } from 'moment-timezone';

@Injectable()
export class AppMomentDateAdapter extends MomentDateAdapter {
  constructor(
    languageService: LanguageService,
    @Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string,
    @Optional()
    @Inject(MAT_MOMENT_DATE_ADAPTER_OPTIONS)
    options?: MatMomentDateAdapterOptions
  ) {
    super(matDateLocale, options);
    const locale = languageService.determineCurrentLang();
    this.setLocale(locale);
  }
}

@Injectable()
export class AppMomentDatetimeAdapter extends MomentDatetimeAdapter {
  constructor() {
    super();
    const delegate = inject<DateAdapter<Moment>>(DateAdapter);
    this.setLocale(moment.locale());
    delegate.setLocale(moment.locale());
  }
}
