import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { LOGIN_URL } from '@app/app.routes';
import { TranslateModule } from '@ngx-translate/core';
import { NavService } from '@shared/components/nav.service';

@Component({
  templateUrl: './logged-out.component.html',
  styleUrls: ['./logged-out.component.scss'],
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardActions,
    MatButton,
    RouterLink,
    TranslateModule
  ]
})
export class LoggedOutComponent implements OnInit {
  loginUrl = LOGIN_URL;

  constructor(private navService: NavService) {}

  ngOnInit(): void {
    this.navService.setLocation('Abgemeldet');
  }
}
