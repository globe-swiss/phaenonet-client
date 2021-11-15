import { ErrorHandler, Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private sentryErrorHandler = Sentry.createErrorHandler({ showDialog: false });

  handleError(error: ErrorEvent): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;

    if (chunkFailedMessage.test(error.message)) {
      Sentry.captureMessage('Chunk load failed. Reloading.');
      window.location.reload();
    } else {
      this.sentryErrorHandler.handleError(error);
    }
  }
}
