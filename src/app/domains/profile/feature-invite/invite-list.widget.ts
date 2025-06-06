import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { InviteDialogComponent } from './invite-dialog.component';
import { InviteDialogData } from './invite-dialog.model';
import { InviteItemComponent } from './invite-item.widget';
import { Invite } from './invite.model';
import { InviteService } from './invite.service';

@Component({
  selector: 'app-invite-list',
  templateUrl: './invite-list.widget.html',
  styleUrls: ['./invite-list.widget.scss'],
  imports: [TranslateModule, NgIf, NgFor, InviteItemComponent, MatButton, AsyncPipe]
})
export class InviteListComponent implements OnInit {
  @Input() userId: string;
  openInvites$: Observable<Invite[]>;
  acceptedInvites$: Observable<Invite[]>;

  constructor(
    private dialog: MatDialog,
    private inviteService: InviteService
  ) {}

  ngOnInit(): void {
    const inviteSort = (i1: Invite, i2: Invite) => i2.modified.toMillis() - i1.modified.toMillis();

    const invites$ = this.inviteService.getInvites().pipe(
      map(invites => invites.filter(invite => invite.modified)), // filter invites where modification ts was not set yet
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.openInvites$ = invites$.pipe(map(invites => invites.filter(invite => !invite.register_nick).sort(inviteSort)));
    this.acceptedInvites$ = invites$.pipe(
      map(invites => invites.filter(invite => invite.register_nick).sort(inviteSort))
    );
  }

  invite(): void {
    const dialogRef = this.dialog.open(InviteDialogComponent, {
      width: '615px',
      panelClass: 'phenonet-dialog-component'
    });

    dialogRef.afterClosed().subscribe((result: InviteDialogData) => {
      if (result) {
        this.inviteService.addInvite(result.email);
      }
    });
  }
}
