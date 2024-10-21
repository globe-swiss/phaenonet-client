import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import * as Sentry from '@sentry/angular-ivy';
import { Observable, from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { httpInterceptorProviders } from './http-interceptors';
import { IndividualService } from './individual/individual.service';
import { LoginModule } from './login/login.module';
import { MapService } from './map/map.service';
import { MasterdataService } from './masterdata/masterdata.service';
import { UserService } from './profile/user.service';
import { SensorsService } from './sensors/sensors.service';
import { GlobalErrorHandler } from './shared/GlobalErrorHandler';
import { SentryMissingTranslationHandler } from './shared/SentryMissingTranslationHandler';
import { SharedModule } from './shared/shared.module';

export class CustomTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<unknown> {
    return from(import(`../assets/i18n/${lang}.json`));
  }
}

registerLocaleData(localeDe, 'de');
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeIt, 'it');

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader
      },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: SentryMissingTranslationHandler }
    }),
    CoreModule,
    AppRoutingModule,
    LoginModule
  ],
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
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule {}
