import { Injectable } from '@angular/core';
import { Firestore, increment, where } from '@angular/fire/firestore';
import { IdLike } from '@core/core.model';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { BaseResourceService } from '@core/services/base-resource.service';
import { FirestoreDebugService } from '@core/services/firestore-debug.service';
import { LanguageService } from '@core/services/language.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Invite } from './invite.model';

@Injectable({ providedIn: 'root' })
export class InviteService extends BaseResourceService<Invite> {
  constructor(
    protected afs: Firestore,
    protected fds: FirestoreDebugService,
    private alertService: AlertService,
    private authService: AuthService,
    private languageService: LanguageService
  ) {
    super(afs, 'invites', fds);
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
