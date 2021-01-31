import { Component, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';
import { LanguageService } from '../language.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  @ViewChild(MatMenuTrigger) searchMenuTrigger: MatMenuTrigger;
  @ViewChild('searchField') searchField: ElementRef;

  constructor(
    private languageService: LanguageService,
    private translateService: TranslateService,
    private authService: AuthService
  ) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  nickname(): string {
    return this.authService.getUserNickname();
  }

  logout() {
    this.authService.logout();
  }
}
