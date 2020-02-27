import { Observable, ObservableInput, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

export class HttpErrorHandler {
  constructor(protected router: Router) {}

  // override in subclass if you want a custom error handling
  detailLoadingFailed<T>(error: any, caught: Observable<T>): ObservableInput<any> {
    if (error instanceof HttpErrorResponse && error.status == 404) {
      this.router.navigate(['/404'], { skipLocationChange: true });
      return of();
    }
    return throwError(error);
  }
}
