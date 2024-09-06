import { Component, Signal } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent {
  detailId: Signal<string>;

  constructor(private authService: AuthService) {
    this.detailId = this.authService.uid;
  }
}
