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
