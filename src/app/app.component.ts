import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import browserUpdate from 'browser-update';
import { LanguageService } from './core/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'phaenonet';

  constructor(languageService: LanguageService, translateService: TranslateService) {
    languageService.init();

    translateService.get('browser-support').subscribe(translation =>
      browserUpdate({
        api: 2018.12,
        required: { e: 14, f: 60, o: 53, s: 11, c: 67 },
        text: translation
      })
    );
  }
}
