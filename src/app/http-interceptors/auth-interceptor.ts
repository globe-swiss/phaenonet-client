import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { LoginDialogComponent } from '../login/login-dialog.component';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(request).pipe(
      catchError((error, caught) => {
        if (error.status === 401) {
          this.authService.logout();
          let currentRef = this.dialog.openDialogs.find(x => x.componentInstance instanceof LoginDialogComponent);
          if (!currentRef) {
            currentRef = this.dialog.open(LoginDialogComponent, { disableClose: true });
          }
          return currentRef.afterClosed().pipe(
            switchMap(() => {
              return this.intercept(request, next);
            })
          );
        }
        return throwError(error);
      })
    );
  }
}
