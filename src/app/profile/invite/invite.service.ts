import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { BaseResourceService } from 'src/app/core/base-resource.service';
import { LanguageService } from 'src/app/core/language.service';
import { IdLike } from 'src/app/masterdata/masterdata-like';
import { AlertService } from 'src/app/messaging/alert.service';
import { Invite } from './invite';

@Injectable({
  providedIn: 'root'
})
export class InviteService extends BaseResourceService<Invite> {
  constructor(
    protected alertService: AlertService,
    protected afs: AngularFirestore,
    protected authService: AuthService,
    protected languageService: LanguageService
  ) {
    super(alertService, afs, 'invites');
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
    return this.afs
      .collection<Invite>(this.collectionName, ref => ref.where('user', '==', this.authService.getUserId()))
      .valueChanges({ idField: 'id' });
  }

  resendInvite(invite: Invite, id: string) {
    if (!invite.sent || new Date().getTime() - invite.sent.toDate().getTime() > 10 * 60 * 1000) {
      invite.resend = firebase.firestore.FieldValue.increment(1);
      this.upsert(invite, id);
    } else {
      this.alertService.infoMessage(
        'Erneutes Senden noch nicht möglich',
        'Einladungen können höchstens alle 10 Minuten erneut gesendet werden.'
      );
    }
  }
}
