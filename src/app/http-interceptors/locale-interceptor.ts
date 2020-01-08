import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable()
export class LocaleInterceptor implements HttpInterceptor {
  constructor(private translateService: TranslateService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const locale = this.translateService.currentLang || this.translateService.defaultLang;

    let headers = request.headers.set('X-Locale', locale);

    const modifiedRequest = request.clone({
      headers: headers
    });

    return next.handle(modifiedRequest);
  }
}
