import { Injectable } from '@angular/core';
import { BaseHttpService } from '../core/base-http.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AlertService, Level, UntranslatedAlertMessage } from '../messaging/alert.service';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, OperatorFunction, throwError, of, from } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Group } from './group';

@Injectable()
export class GroupService extends BaseHttpService {
  constructor(
    http: HttpClient,
    alertService: AlertService,
    private authService: AuthService,
    private afs: AngularFirestore
  ) {
    super(http, alertService);
  }

  /**
   * return the list of groups for the logged in user.
   */
  getMyGroups(): Observable<Group[]> {
    return this.authService.user.pipe(
      switchMap(user => {
        if (user) {
          return from(this.afs.collection('groups', ref => ref.where('creator', '==', user.email)).valueChanges());
        } else {
          return of([]);
        }
      })
    );
  }
}
