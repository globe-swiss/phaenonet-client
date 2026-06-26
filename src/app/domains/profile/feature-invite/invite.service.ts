import { Injectable, inject } from '@angular/core';
import { increment, where } from '@angular/fire/firestore';
import { IdLike } from '@core/core.model';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { BaseResourceService } from '@core/services/base-resource.service';
import { LanguageService } from '@core/services/language.service';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { Invite } from './invite.model';

@Injectable({ providedIn: 'root' })
export class InviteService extends BaseResourceService<Invite> {
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private languageService = inject(LanguageService);

  constructor() {
    super('invites');
  }

  addInvite(email: string) {
    email = email.trim().toLowerCase();
    const invite = {
      user: this.authService.getUserId(),
      email: email,
      locale: this.languageService.determineCurrentLang()
    };
    this.upsert('InviteService.addInvite', invite, this.authService.getUserId() + '_' + email);
  }

  getInvites(): Observable<(Invite & IdLike)[]> {
    return this.queryCollection('InviteService.getInvites', where('user', '==', this.authService.getUserId()));
  }

  resendInvite(invite: Invite, id: string) {
    if (!invite.sent || new Date().getTime() - invite.sent.toDate().getTime() > 10 * 60 * 1000) {
      invite.resend = increment(1);
      this.upsert('InviteService.resendInvite', invite, id)
        .pipe(
          take(1),
          tap(() => {
            this.alertService.infoMessage(
              'Einladung erneut gesendet',
              'Die Einladung wurde erfolgreich erneut gesendet.'
            );
          })
        )
        .subscribe();
    } else {
      this.alertService.infoMessage(
        'Erneutes Senden noch nicht möglich',
        'Einladungen können höchstens alle 10 Minuten erneut gesendet werden.'
      );
    }
  }

  deleteInvite(id: string) {
    void this.delete('InviteService.deleteInvite', id);
  }
}
