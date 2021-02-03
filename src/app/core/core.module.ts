import { NgModule, Optional, SkipSelf } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';

import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { AlertComponent } from '../messaging/alert.component';
import { AlertService } from '../messaging/alert.service';
import { AppSnackBarComponent } from '../messaging/app-snack-bar.component';
import { SharedModule } from '../shared/shared.module';
import { ExceptionService } from './exception.service';
import { LanguageService } from './language.service';
import { MaterialModule } from './material.module';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { NavComponent } from './nav/nav.component';
import { NavService } from './nav/nav.service';

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
