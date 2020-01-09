import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { Option, none } from 'fp-ts/lib/Option';

export abstract class BaseHttpService {
  constructor(private http: HttpClient, protected alertService: AlertService) {}

  withoutErrorHandling<T>(request: (HttpClient: HttpClient) => Observable<T>): Observable<T> {
    return request(this.http).pipe(shareReplay(1));
  }

  withErrorHandling<T>(
    errorKey: string,
    request: (httpClient: HttpClient) => Observable<T>,
    ignoreStatus: number[] = [],
    titleParams: Object = Object,
    errorDuration: Option<number> = none
  ): Observable<T> {
    return request(this.http)
      .pipe(
        catchError(error => this.handleHttpError(error, errorKey, ignoreStatus, titleParams, errorDuration)),
        map(r => r as T)
      )
      .pipe(shareReplay(1));
  }

  private handleHttpError<R>(
    error: Object,
    errorTitle: string,
    ignoreStatus: number[],
    titleParams: Object,
    errorDuration: Option<number>
  ): Observable<R> {
    if (error instanceof HttpErrorResponse && ignoreStatus.indexOf(error.status) === -1) {
      this.alertService.alertMessage({
        title: errorTitle,
        message: 'generic-http-error-message',
        level: Level.ERROR,
        messageParams: error,
        titleParams: titleParams,
        duration: errorDuration
      } as UntranslatedAlertMessage);
    }
    return throwError(error);
  }
}
