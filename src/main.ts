import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Sentry from '@sentry/angular-ivy';
import { Integrations } from '@sentry/tracing';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';

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

void platformBrowserDynamic([
  {
    provide: FIREBASE_OPTIONS,
    useValue: {
      apiKey: 'AIzaSyAP01itULnjw9Gx5LRyE6qi_GLJKhBMUz4',
      appId: '1:379498871574:web:6b33f0fa19cf8e38c3ee37',
      authDomain: 'phaenonet-test.firebaseapp.com',
      databaseURL: 'https://phaenonet-test.firebaseio.com',
      measurementId: 'G-G3YRJD9PZ1',
      messagingSenderId: '379498871574',
      projectId: 'phaenonet-test',
      storageBucket: 'phaenonet-test.appspot.com'
    }
  }
]).bootstrapModule(AppModule);
