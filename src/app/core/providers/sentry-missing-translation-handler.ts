import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import * as Sentry from '@sentry/angular';
import { environment } from '~/environments/environment';

export class SentryMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    // bugfix for wrong positives
    if (this.checkTranslationError(params)) {
      return params.key;
    }

    // ignore numbers and missing translations is german
    if (params.translateService.getCurrentLang() !== 'de-CH' && !Number(params.key)) {
      if (environment.name === 'local') {
        console.error(this.getMsg(params));
      }
      Sentry.captureMessage(this.getMsg(params));
    }
    return params.key;
  }

  getMsg(params: MissingTranslationHandlerParams) {
    return 'Translation Error: ' + params.key + ' not found for ' + params.translateService.getCurrentLang();
  }

  /*
   * Check if the module was already loaded.
   * On initial page load the missing translations handler is called
   * once only with the default language causing false positives when
   * reporting missing translations.
   */

  checkTranslationError(params: MissingTranslationHandlerParams) {
    const currentLang = params.translateService.getCurrentLang();
    return !params.translateService.getLangs().includes(currentLang);
  }
}
