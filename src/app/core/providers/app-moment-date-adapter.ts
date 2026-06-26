import { inject, Injectable } from '@angular/core';
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
  constructor() {
    const languageService = inject(LanguageService);
    const matDateLocale = inject(MAT_DATE_LOCALE, { optional: true });
    const options = inject<MatMomentDateAdapterOptions>(MAT_MOMENT_DATE_ADAPTER_OPTIONS, { optional: true });

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
