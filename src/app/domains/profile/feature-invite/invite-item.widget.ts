import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ShortdatePipe } from '@shared/utils/shortdate.pipe';
import { UserSubscriptionButtonComponent } from '../shared/user-subscription.widget';
import { Invite } from './invite.model';
import { InviteService } from './invite.service';
import { MaybeIdLike } from '@core/core.model';

@Component({
  selector: 'app-invite-item',
  templateUrl: './invite-item.widget.html',
  styleUrls: ['./invite-item.widget.scss'],
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
