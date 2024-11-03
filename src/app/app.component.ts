import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { AppSnackBarComponent } from '@shared/components/alert.widget';
import { NavComponent } from '@shared/components/nav.widget';
import browserUpdate from 'browser-update';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [AppSnackBarComponent, RouterOutlet, NavComponent]
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

    this.matIconRegistry.addSvgIcon(
      'resend-mail',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/img/btn_resend_email.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'ranger-badge',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/img/ico_phenorangers.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'flyout-arrow',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/img/flyout_ico_arrow_right.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'arrow-left',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/img/ico_arrow_left.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'arrow-right',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/img/ico_arrow_right.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'map-pin',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/img/map_pins/map_pin_generic.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'humidity',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/img/ico_humidity.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'temperature',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/img/ico_temperature.svg')
    );
  }
}
