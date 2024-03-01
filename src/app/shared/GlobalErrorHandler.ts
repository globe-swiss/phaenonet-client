import { ErrorHandler, Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular-ivy';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../profile/user.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  private sentryErrorHandler = Sentry.createErrorHandler({ showDialog: false });

  handleError(error: ErrorEvent): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;

    if (chunkFailedMessage.test(error.message)) {
      Sentry.captureMessage('Chunk load failed. Reloading.');
      window.location.reload();
    } else {
      const userid = this.authService.getUserId();
      if (userid) {
        void firstValueFrom(this.userService.getSource()).then(sourceType => {
          Sentry.setUser({ id: userid });
          Sentry.setTag('source', sourceType);
          this.sentryErrorHandler.handleError(error);
        });
      } else {
        Sentry.setTag('source', 'none');
        this.sentryErrorHandler.handleError(error);
      }
    }
  }
}
