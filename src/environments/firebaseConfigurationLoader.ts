import { FirebaseOptions } from '@angular/fire/app';

export function getConfig(): FirebaseOptions {
  let config;
  const request = new XMLHttpRequest();
  try {
    request.open('GET', '__/firebase/init.json', false); // `false` makes the request synchronous
    request.send(null);

    if (request.status === 200) {
      config = request.responseText;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return JSON.parse(config) as FirebaseOptions;
  } catch (e) {
    console.error('environment:getConfig: unable to get api key : ', e);
  }
}
