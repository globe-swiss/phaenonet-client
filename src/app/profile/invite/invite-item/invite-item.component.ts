import { Component, Input, OnInit } from '@angular/core';
import { MaybeIdLike } from 'src/app/masterdata/masterdata-like';
import { Invite } from '../invite';
import { InviteService } from '../invite.service';

@Component({
  selector: 'app-invite-item',
  templateUrl: './invite-item.component.html',
  styleUrls: ['./invite-item.component.scss']
})
export class InviteItemComponent {
  @Input() item: Invite & MaybeIdLike;

  constructor(private inviteService: InviteService) {}

  resendInvite() {
    if (this.item.id) {
      this.inviteService.resendInvite(this.item, this.item.id);
    }
  }
}
