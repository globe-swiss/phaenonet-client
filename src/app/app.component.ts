import { Component } from '@angular/core';
import browserUpdate from 'browser-update';
import { LanguageService } from './core/language.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'phaenonet';

  constructor(
    languageService: LanguageService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    languageService.init();

    browserUpdate({
      api: 2018.12,
      required: { e: 14, f: 60, o: 53, s: 11, c: 67 },
      l: languageService.determineCurrentLang()
    });

    this.matIconRegistry.addSvgIcon(
      'subscribe-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/img/btn_subscribe_active.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'subscribe',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/img/btn_subscribe_normal.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'copylink',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/img/btn_copyurl_normal.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'locateMe',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/img/ico_btn_locateme.svg')
    );
  }
}
