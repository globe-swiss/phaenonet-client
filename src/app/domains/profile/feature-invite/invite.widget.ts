import { Component, Signal, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { InviteListComponent } from './invite-list.widget';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.widget.html',
  styleUrls: ['./invite.widget.scss'],
  imports: [InviteListComponent]
})
export class InviteComponent {
  private authService = inject(AuthService);

  detailId: Signal<string>;

  constructor() {
    this.detailId = this.authService.uid;
  }
}
