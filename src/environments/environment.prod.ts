// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { getConfig } from './firebaseConfigurationLoader';

export const environment = {
  production: true,
  debugFirestore: true,
  name: 'production',
  sentrySamplerate: 1.0,
  sentryEnabled: true,
  version: '#VERSION#',
  firebaseConfig: getConfig()
};
