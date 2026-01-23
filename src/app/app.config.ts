import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import {
  ApplicationConfig,
  ErrorHandler,
  enableProdMode,
  importProvidersFrom,
  inject,
  provideAppInitializer
} from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PreloadAllModules, Router, provideRouter, withPreloading } from '@angular/router';
import { HeaderInterceptor } from '@core/providers/header.interceptor';
import { LocaleInterceptor } from '@core/providers/locale.interceptor';
import { GoogleMapsLoaderService } from '@core/services/google-maps-loader.service';
import { DatetimeAdapter } from '@mat-datetimepicker/core';
import { MissingTranslationHandler, TranslateService, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import * as Sentry from '@sentry/angular';
import moment from 'moment-timezone';
import { lastValueFrom } from 'rxjs';
import { environment } from '~/environments/environment';
import { routes } from './app.routes';
import { AppMomentDateAdapter, AppMomentDatetimeAdapter } from './core/providers/app-moment-date-adapter';
import { GlobalErrorHandler } from './core/providers/global-error-handler';
import { SentryMissingTranslationHandler } from './core/providers/sentry-missing-translation-handler';

// Set default timezone to Europe/Zurich for all moment operations
moment.tz.setDefault('Europe/Zurich');

Sentry.init({
  enabled: environment.sentryEnabled,
  release: environment.version,
  environment: environment.name,
  dsn: 'https://b0f9e54dab264d1881553cbfbcc1641a@o510696.ingest.sentry.io/5606738',
  integrations: [Sentry.browserTracingIntegration()],
  tracePropagationTargets: ['localhost', /^\//],
  tracesSampleRate: environment.sentrySamplerate
});

Sentry.addEventProcessor(event => {
  if (event.type === 'transaction') {
    //remove specific ids to enable performance tracking in sentry
    event.transaction = sanitizeTransactionName(event.transaction);
  }
  return event;
});

registerLocaleData(localeDe, 'de');
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeIt, 'it');

if (environment.production) {
  enableProdMode();
  setSentryConsoleHandlers();
}

function sanitizeTransactionName(transaction: string) {
  const regexp = new RegExp('/(individuals|stations|profile)/(?!new)([^/]*)');
  if (regexp.test(transaction)) {
    return transaction.replace(regexp, '/$1/:id');
  } else return transaction;
}

export function setSentryConsoleHandlers() {
  // Store original console methods
  const { error: originalError, warn: originalWarn } = console;

  // Override console.error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.error = (...args: any[]) => {
    const error = args[0] instanceof Error ? args[0] : new Error(args.join(' '));
    Sentry.captureException(error, {
      contexts: {
        console: {
          arguments: args.length > 1 ? args : undefined,
          origin: 'console.error'
        }
      }
    });
    originalError.apply(console, args);
  };

  // Override console.warn
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.warn = (...args: any[]) => {
    Sentry.captureMessage(args.join(' '), {
      level: 'warning',
      contexts: {
        console: {
          arguments: args.length > 1 ? args : undefined,
          origin: 'console.warn'
        }
      }
    });
    originalWarn.apply(console, args);
  };

  // Silence console.log in production
  console.log = () => {};
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const initializerFn = (
        (translate: TranslateService) => () =>
          lastValueFrom(translate.use('de-CH'))
      )(inject(TranslateService));
      return initializerFn();
    }),
    provideAppInitializer(() => {
      const initializerFn = (
        (googleMapsLoader: GoogleMapsLoaderService) => () =>
          googleMapsLoader.load()
      )(inject(GoogleMapsLoaderService));
      return initializerFn();
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideTranslateService({
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: SentryMissingTranslationHandler }
    }),
    provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    importProvidersFrom(BrowserModule, ReactiveFormsModule),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: Sentry.TraceService,
      deps: [Router]
    },
    provideAppInitializer(() => {
      const initializerFn = ((_: Sentry.TraceService) => () => {})(inject(Sentry.TraceService));
      return initializerFn();
    }),
    [
      { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: LocaleInterceptor, multi: true }
    ],
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    provideFirestore(() => getFirestore()),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    { provide: DateAdapter, useClass: AppMomentDateAdapter },
    { provide: DatetimeAdapter, useClass: AppMomentDatetimeAdapter },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'l'
        },
        display: {
          dateInput: 'L',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY'
        }
      } as MatDateFormats
    }
  ]
};
