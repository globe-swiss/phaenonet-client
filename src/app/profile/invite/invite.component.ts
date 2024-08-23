import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { NgIf } from '@angular/common';
import { InviteListComponent } from './invite-list/invite-list.component';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss'],
  standalone: true,
  imports: [NgIf, InviteListComponent]
})
export class InviteComponent implements OnInit {
  detailId: string;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.detailId = this.authService.getUserId();
  }
}
