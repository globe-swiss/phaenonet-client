import { Component, Input, OnInit } from '@angular/core';
import { Invite } from '../invite';

@Component({
  selector: 'app-invite-item',
  templateUrl: './invite-item.component.html',
  styleUrls: ['./invite-item.component.scss']
})
export class InviteItemComponent implements OnInit {
  @Input() item: Invite;

  constructor() {}

  ngOnInit(): void {}

  resendInvite() {
    console.log('Resend invite'); // fixme: remove log output
  }
}
