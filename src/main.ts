import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { FirebaseOptionsToken } from '@angular/fire';

if (environment.production) {
  enableProdMode();
}

function loadConfig() {
  return fetch('/__/firebase/init.json').then(response => response.json());
}

(async () => {
  const config = await loadConfig();

  platformBrowserDynamic([{ provide: FirebaseOptionsToken, useValue: config }])
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
})();
