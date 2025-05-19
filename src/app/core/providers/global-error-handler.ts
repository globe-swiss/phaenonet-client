import { ErrorHandler, Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import * as Sentry from '@sentry/angular';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private authService: AuthService) {}

  private sentryErrorHandler = Sentry.createErrorHandler({ showDialog: false });

  handleError(error: ErrorEvent): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;

    if (chunkFailedMessage.test(error.message)) {
      Sentry.captureMessage('Chunk load failed. Reloading.');
      window.location.reload();
    } else {
      const userid = this.authService.getUserId();
      if (userid) {
        Sentry.setUser({ id: userid });
        this.sentryErrorHandler.handleError(error);
      } else {
        Sentry.setTag('source', 'none');
        this.sentryErrorHandler.handleError(error);
      }
    }
  }
}
