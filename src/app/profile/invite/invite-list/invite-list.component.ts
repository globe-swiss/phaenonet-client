import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Invite } from '../invite';
import { InviteDialogData } from '../invite-dialog/invite-dialog-data';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';
import { InviteService } from '../invite.service';

@Component({
  selector: 'app-invite-list',
  templateUrl: './invite-list.component.html',
  styleUrls: ['./invite-list.component.scss']
})
export class InviteListComponent implements OnInit {
  @Input() userId: string;
  invites$: Observable<Invite[]>;

  constructor(private dialog: MatDialog, private inviteService: InviteService) {}

  ngOnInit(): void {
    this.invites$ = this.inviteService.getInvites();
  }

  invite(): void {
    const dialogRef = this.dialog.open(InviteDialogComponent, {
      width: '615px'
    });

    dialogRef.afterClosed().subscribe((result: InviteDialogData) => {
      if (result) {
        this.inviteService.addInvite(result.email);
      }
    });
  }
}
