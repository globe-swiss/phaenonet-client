import * as moment from 'moment';
import { Injectable, Inject, Optional } from '@angular/core';
import { MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import {
  MomentDateAdapter,
  MatMomentDateAdapterOptions,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS
} from '@angular/material-moment-adapter';
import { MomentDatetimeAdapter } from '@mat-datetimepicker/moment';
import { Moment } from 'moment';
import { LanguageService } from './language.service';

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
  constructor(@Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string, _delegate: DateAdapter<Moment>) {
    // constructor(matDateLocale: string, matMomentAdapterOptions: MatMomentDateAdapterOptions, _delegate: DateAdapter<Moment>);
    super(matDateLocale, {}, _delegate);
    this.setLocale(moment.locale());
    _delegate.setLocale(moment.locale());
  }
}
