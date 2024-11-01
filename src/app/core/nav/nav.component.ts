import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { LanguageService } from '../language.service';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  standalone: true,
  imports: [MatToolbar, MatToolbarRow, NgIf, MatButton, RouterLink, TranslateModule]
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
