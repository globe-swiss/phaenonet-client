import { Injectable } from '@angular/core';
import { Firestore, increment, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { BaseResourceService } from 'src/app/core/base-resource.service';
import { LanguageService } from 'src/app/core/language.service';
import { IdLike } from 'src/app/masterdata/masterdata-like';
import { AlertService } from 'src/app/messaging/alert.service';
import { FirestoreDebugService } from 'src/app/shared/firestore-debug.service';
import { Invite } from './invite';

@Injectable({
  providedIn: 'root'
})
export class InviteService extends BaseResourceService<Invite> {
  constructor(
    protected alertService: AlertService,
    protected afs: Firestore,
    protected authService: AuthService,
    protected languageService: LanguageService,
    protected fds: FirestoreDebugService
  ) {
    super(alertService, afs, 'invites', fds);
  }

  addInvite(email: string) {
    email = email.trim().toLowerCase();
    const invite = {
      user: this.authService.getUserId(),
      email: email,
      locale: this.languageService.determineCurrentLang()
    };
    this.upsert(invite, this.authService.getUserId() + '_' + email);
  }

  getInvites(): Observable<(Invite & IdLike)[]> {
    return this.queryCollection(where('user', '==', this.authService.getUserId())).pipe(
      tap(x => this.fds.addRead('activities (getInvites)', x.length))
    );
  }

  resendInvite(invite: Invite, id: string) {
    if (!invite.sent || new Date().getTime() - invite.sent.toDate().getTime() > 10 * 60 * 1000) {
      invite.resend = increment(1);
      this.upsert(invite, id);
    } else {
      this.alertService.infoMessage(
        'Erneutes Senden noch nicht möglich',
        'Einladungen können höchstens alle 10 Minuten erneut gesendet werden.'
      );
    }
  }
}
