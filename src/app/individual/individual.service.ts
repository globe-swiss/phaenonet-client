import { Injectable } from '@angular/core';
import { BaseHttpService } from '../core/base-http.service';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../messaging/alert.service';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Individual } from './individual';

@Injectable()
export class IndividualService extends BaseHttpService {
  constructor(
    http: HttpClient,
    alertService: AlertService,
    private authService: AuthService,
    private afs: AngularFirestore
  ) {
    super(http, alertService);
  }

  getIndividuals(): Observable<Individual[]> {
    return this.afs.collection<Individual>('objects').valueChanges();
  }
}
