import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { APP_INITIALIZER, ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { PreloadAllModules, provideRouter, Router, withDebugTracing, withPreloading } from '@angular/router';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import * as Sentry from '@sentry/angular-ivy';
import { from, Observable } from 'rxjs';
import { routes } from './app.routes';
import { httpInterceptorProviders } from './http-interceptors';
import { GlobalErrorHandler } from './shared/GlobalErrorHandler';
import { SentryMissingTranslationHandler } from './shared/SentryMissingTranslationHandler';

export class CustomTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<unknown> {
    return from(import(`../assets/i18n/${lang}.json`));
  }
}

registerLocaleData(localeDe, 'de');
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeIt, 'it');

function getConfig() {
  let config;
  let request = new XMLHttpRequest();
  try {
    request.open('GET', '/__/firebase/init.json', false); // `false` makes the request synchronous
    request.send(null);
    if (request.status === 200) {
      console.log(request.responseText);
      config = request.responseText;
    }

    return JSON.parse(config);
  } catch (e) {
    console.error('environment:getConfig: unable to get api key : ', e);
  }

  return config;
}

// function loadConfig() {
//   fetch('/__/firebase/init.json')
//     .then(response =>
//       response.json().then(config =>
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//         platformBrowserDynamic([{ provide: FIREBASE_OPTIONS, useValue: config }]).bootstrapModule(AppModule)
//       )
//     )
//     .catch(() => Sentry.captureMessage('Could not fetch firebase config.', 'fatal'));
// }

// void loadConfig();

console.log('config', getConfig());

export const appConfig: ApplicationConfig = {
  providers: [
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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true
    },
    httpInterceptorProviders,
    // ScreenTrackingService,
    // UserTrackingService,
    // { provide: DEBUG_MODE, useValue: true }
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader
        },
        missingTranslationHandler: { provide: MissingTranslationHandler, useClass: SentryMissingTranslationHandler }
      })
    ),
    provideFirebaseApp(() => initializeApp(getConfig())),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideRouter(routes, withPreloading(PreloadAllModules), withDebugTracing())
  ]
};
