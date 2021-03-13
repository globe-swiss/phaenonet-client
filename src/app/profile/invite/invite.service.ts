import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/auth/auth.service';
import { BaseResourceService } from 'src/app/core/base-resource.service';
import { LanguageService } from 'src/app/core/language.service';
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

  getInvites() {
    return (
      this.afs
        .collection<Invite>(this.collectionName, ref => ref.where('user', '==', this.authService.getUserId()))
        // .valueChanges({ idField: 'id' })
        .valueChanges()
    );
    // .pipe(
    //   map(invites =>
    //     invites.map(o => {
    //       o.date = o.date ? (o.date as any).toDate() : o.date;
    //       o.created = o.created ? (o.created as any).toDate() : o.created;
    //       o.modified = o.modified ? (o.modified as any).toDate() : o.modified;

    //       return o;
    //     })
    //   )
    // );
    // }
  }
}
