import { NgModule, Optional, SkipSelf } from '@angular/core';

import { MaterialModule } from './material.module';

import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';

import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { ExceptionService } from './exception.service';
import { NavComponent } from './nav/nav.component';
import { AppSnackBarComponent } from '../messaging/app-snack-bar.component';

import { throwIfAlreadyLoaded } from './module-import-guard';
import { SharedModule } from '../shared/shared.module';
import { AlertService } from '../messaging/alert.service';
import { AlertComponent } from '../messaging/alert.component';
import { NavService } from './nav/nav.service';
import { LanguageService } from './language.service';

/**
 * The `CoreModule` is used to group singleton services like {@link ExceptionService} and single-use components like {@link NavComponent}.
 */
@NgModule({
  imports: [SharedModule, AuthModule],
  exports: [AuthModule, MaterialModule, NavComponent, AppSnackBarComponent, TranslateModule],
  declarations: [NavComponent, AppSnackBarComponent, AlertComponent],
  providers: [AlertService, AuthService, ExceptionService, LanguageService, NavService, TranslateService],
  entryComponents: [AlertComponent]
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
