import { getConfig } from './firebaseConfigurationLoader';

export const environment = {
  production: false,
  debugFirestore: false,
  name: 'test',
  sentrySamplerate: 1.0,
  sentryEnabled: true,
  version: '#VERSION#',
  firebaseConfig: getConfig()
};
