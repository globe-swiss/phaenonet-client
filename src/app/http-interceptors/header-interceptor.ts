import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    let headers = request.headers.set('Access-Control-Allow-Credentials', 'true');
    if (!(request.body instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }
    const modifiedRequest = request.clone({
      headers: headers
    });
    return next.handle(modifiedRequest);
  }
}
