import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, ObservableInput, of, throwError } from 'rxjs';

export class HttpErrorHandler {
  constructor(protected router: Router) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  detailLoadingFailed<T>(error: unknown, caught: Observable<T>): ObservableInput<unknown> {
    if (error instanceof HttpErrorResponse && error.status == 404) {
      void this.router.navigate(['/404'], { skipLocationChange: true });
      return of();
    }
    return throwError(error);
  }
}
