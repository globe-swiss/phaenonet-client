import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavService } from '@shared/components/nav.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
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
export class NotFoundComponent implements OnInit {
  constructor(private navService: NavService) {}

  ngOnInit(): void {
    this.navService.setLocation('Hier ist etwas schiefgelaufen.');
  }
}
