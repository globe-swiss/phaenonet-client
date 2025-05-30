import { NgIf } from '@angular/common';
import { Component, Signal } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { InviteListComponent } from './invite-list.widget';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.widget.html',
  styleUrls: ['./invite.widget.scss'],
  imports: [NgIf, InviteListComponent]
})
export class InviteComponent {
  detailId: Signal<string>;

  constructor(private authService: AuthService) {
    this.detailId = this.authService.uid;
  }
}
