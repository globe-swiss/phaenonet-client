import { Component, Input, OnInit } from '@angular/core';
import { IdLike } from 'src/app/masterdata/masterdata-like';
import { Invite } from '../invite';
import { InviteService } from '../invite.service';

@Component({
  selector: 'app-invite-item',
  templateUrl: './invite-item.component.html',
  styleUrls: ['./invite-item.component.scss']
})
export class InviteItemComponent implements OnInit {
  @Input() item: Invite & IdLike;

  constructor(private inviteService: InviteService) {}

  ngOnInit(): void {}

  resendInvite() {
    this.inviteService.resendInvite(this.item, this.item.id);
  }
}
