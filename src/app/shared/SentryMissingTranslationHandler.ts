import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import * as Sentry from '@sentry/angular';
import { environment } from 'src/environments/environment';

export class SentryMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    if (params.translateService.currentLang !== 'de-CH' && !Number(params.key)) {
      if (environment.name === 'local') {
        console.log(this.getMsg(params));
      }
      Sentry.captureMessage(this.getMsg(params));
    }
    return params.key;
  }

  getMsg(params: MissingTranslationHandlerParams) {
    return 'Translation Error: ' + params.key + ' not found for ' + params.translateService.currentLang;
  }
}
