import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { BaseResourceService } from '../core/base-resource.service';
import { AlertService } from '../messaging/alert.service';
import { User } from './user';

@Injectable()
export class UserService extends BaseResourceService<User> {
  constructor(alertService: AlertService, protected afs: AngularFirestore, private authService: AuthService) {
    super(alertService, afs, 'users');
  }

  getNickname(id: string): Observable<string> {
    return this.get(id).pipe(map(u => u.nickname));
  }
}
