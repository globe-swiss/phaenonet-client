import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { APP_INITIALIZER, ErrorHandler, enableProdMode, importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import * as Sentry from '@sentry/angular-ivy';
import { Integrations } from '@sentry/tracing';
import { Observable, from } from 'rxjs';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { httpInterceptorProviders } from './app/http-interceptors';
import { IndividualService } from './app/individual/individual.service';
import { LoginModule } from './app/login/login.module';
import { MapService } from './app/map/map.service';
import { MasterdataService } from './app/masterdata/masterdata.service';
import { UserService } from './app/profile/user.service';
import { SensorsService } from './app/sensors/sensors.service';
import { GlobalErrorHandler } from './app/shared/GlobalErrorHandler';
import { SentryMissingTranslationHandler } from './app/shared/SentryMissingTranslationHandler';
import { environment } from './environments/environment';

Sentry.init({
  enabled: environment.sentryEnabled,
  release: environment.version,
  environment: environment.name,
  dsn: 'https://b0f9e54dab264d1881553cbfbcc1641a@o510696.ingest.sentry.io/5606738',
  autoSessionTracking: true,
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: ['localhost', /^\//],
      routingInstrumentation: Sentry.routingInstrumentation
    })
  ],
  tracesSampleRate: environment.sentrySamplerate
});

Sentry.addGlobalEventProcessor(event => {
  if (event.type === 'transaction') {
    //remove specific ids to enable performance tracking in sentry
    event.transaction = sanitizeTransactionName(event.transaction);
  }
  return event;
});

function sanitizeTransactionName(transaction: string) {
  const regexp = new RegExp('/(individuals|stations|profile)/(?!new)([^/]*)');
  if (regexp.test(transaction)) {
    return transaction.replace(regexp, '/$1/:id');
  } else return transaction;
}

if (environment.production) {
  enableProdMode();

  window.console.log = () => {};
}

export class CustomTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<unknown> {
    return from(import(`./assets/i18n/${lang}.json`));
  }
}

registerLocaleData(localeDe, 'de');
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeIt, 'it');

void bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      ReactiveFormsModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader
        },
        missingTranslationHandler: { provide: MissingTranslationHandler, useClass: SentryMissingTranslationHandler }
      }),
      AppRoutingModule,
      LoginModule
    ),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: Sentry.TraceService,
      deps: [Router]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true
    },
    httpInterceptorProviders,
    MasterdataService,
    UserService,
    IndividualService,
    SensorsService,
    MapService,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    provideFirestore(() => getFirestore()),
    // { provide: DEBUG_MODE, useValue: true }
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations()
  ]
});
