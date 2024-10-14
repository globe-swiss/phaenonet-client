import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { LanguageService } from '../language.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
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
