import { Component, AfterViewChecked } from '@angular/core';
import { LOGIN_URL } from '../auth/auth.service';
import { NavService } from '../core/nav/nav.service';

@Component({
  templateUrl: './logged-out.component.html'
})
export class LoggedOutComponent implements AfterViewChecked {
  loginUrl = LOGIN_URL;

  constructor(private navService: NavService) {}

  ngAfterViewChecked(): void {
    this.navService.setLocation('Abgemeldet');
  }
}
