import { Component, Input, OnInit } from '@angular/core';
import { MaybeIdLike } from 'src/app/masterdata/masterdata-like';
import { Invite } from '../invite';
import { InviteService } from '../invite.service';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { UserSubscriptionButtonComponent } from '../../../shared/subscription/user-subscription-button/user-subscription-button.component';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ShortdatePipe } from '../../../shared/shortdate.pipe';

@Component({
  selector: 'app-invite-item',
  templateUrl: './invite-item.component.html',
  styleUrls: ['./invite-item.component.scss'],
  standalone: true,
  imports: [RouterLink, NgIf, UserSubscriptionButtonComponent, MatFabButton, MatIcon, TranslateModule, ShortdatePipe]
})
export class InviteItemComponent {
  @Input() item: Invite & MaybeIdLike;

  constructor(private inviteService: InviteService) {}

  resendInvite(): void {
    if (this.item.id) {
      this.inviteService.resendInvite(this.item, this.item.id);
    }
  }
}
