import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit {
  detailId: string;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.detailId = this.authService.getUserId();
  }
}
