import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService } from '@angular/fire/compat/analytics';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule, SETTINGS } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import * as Sentry from '@sentry/angular';
import { from, Observable } from 'rxjs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { httpInterceptorProviders } from './http-interceptors';
import { IndividualService } from './individual/individual.service';
import { LoginModule } from './login/login.module';
import { MasterdataService } from './masterdata/masterdata.service';
import { UserService } from './profile/user.service';
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
  imports: [
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader
      },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: SentryMissingTranslationHandler }
    }),
    AngularFireModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireAnalyticsModule,
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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true
    },
    httpInterceptorProviders,
    ScreenTrackingService,
    UserTrackingService,
    MasterdataService,
    UserService,
    IndividualService,
    // workaround for https://github.com/firebase/firebase-js-sdk/issues/1674 remove when fixed in the SDK
    { provide: SETTINGS, useValue: { experimentalForceLongPolling: true } }
    // { provide: DEBUG_MODE, useValue: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
