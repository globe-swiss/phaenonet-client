import { LOGIN_URL } from '../app.routes';
import { Component, OnInit } from '@angular/core';
import { NavService } from '../core/nav/nav.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardActions } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

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
