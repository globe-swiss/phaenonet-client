import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.widget.html',
  styleUrls: ['./nav.widget.scss'],
  imports: [MatToolbar, MatToolbarRow, MatButton, RouterLink, TranslateModule]
})
export class NavComponent {
  constructor(
    private authService: AuthService,
    private languageService: LanguageService
  ) {}

  authenticated(): boolean {
    return this.authService.authenticated();
  }

  lang(): string {
    return this.languageService.determineCurrentLang().substring(0, 2);
  }
}
