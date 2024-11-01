import { Component, OnInit } from '@angular/core';
import { NavService } from './nav/nav.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardActions } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
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
