import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule, SETTINGS } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import {
  AngularFireAnalyticsModule,
  ScreenTrackingService,
  UserTrackingService,
  DEBUG_MODE
} from '@angular/fire/analytics';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { httpInterceptorProviders } from './http-interceptors';
import { LoginModule } from './login/login.module';
import { SharedModule } from './shared/shared.module';
import { MasterdataService } from './masterdata/masterdata.service';
import { Router } from '@angular/router';
import * as Sentry from '@sentry/angular';

export class CustomTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
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
      }
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
      useValue: Sentry.createErrorHandler({
        showDialog: false
      })
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
    ScreenTrackingService,
    UserTrackingService,
    MasterdataService,
    // workaround for https://github.com/firebase/firebase-js-sdk/issues/1674 remove when fixed in the SDK
    { provide: SETTINGS, useValue: { experimentalForceLongPolling: true } }
    // { provide: DEBUG_MODE, useValue: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
