import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { LOGIN_URL } from '@app/app.routes';
import { TitleService } from '@core/services/title.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  templateUrl: './logged-out.page.html',
  styleUrls: ['./logged-out.page.scss'],
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

  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    this.titleService.setLocation('Abgemeldet');
  }
}
