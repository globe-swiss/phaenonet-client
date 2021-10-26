import { enableProdMode } from '@angular/core';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Sentry from '@sentry/angular';
import { Integrations } from '@sentry/tracing';
import { AppModule } from './app/app.module';
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

if (environment.production) {
  enableProdMode();
}

function loadConfig() {
  return fetch('/__/firebase/init.json').then(response => response.json());
}

(async () => {
  const config = await loadConfig();

  platformBrowserDynamic([{ provide: FIREBASE_OPTIONS, useValue: config }])
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
})();
