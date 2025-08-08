import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MaybeIdLike } from '@core/core.model';
import { TranslateModule } from '@ngx-translate/core';
import { ShortdatePipe } from '@shared/utils/shortdate.pipe';
import { UserSubscriptionButtonComponent } from '../../../shared/components/feature-subscription/user-subscription.widget';
import { Invite } from './invite.model';
import { InviteService } from './invite.service';

@Component({
  selector: 'app-invite-item',
  templateUrl: './invite-item.widget.html',
  styleUrls: ['./invite-item.widget.scss'],
  imports: [RouterLink, NgIf, UserSubscriptionButtonComponent, MatButton, TranslateModule, ShortdatePipe]
})
export class InviteItemComponent {
  @Input() item: Invite & MaybeIdLike;

  constructor(private inviteService: InviteService) {}

  resendInvite(): void {
    if (this.item.id) {
      this.inviteService.resendInvite(this.item, this.item.id);
    }
  }

  deleteInvite(): void {
    // TODO: Implement invite deletion
    console.log('Delete invite:', this.item.id);
  }
}
