import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthModule } from '../auth/auth.module';
import { AlertComponent } from '../messaging/alert.component';
import { AppSnackBarComponent } from '../messaging/app-snack-bar.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from './material.module';
import { NavComponent } from './nav/nav.component';

/**
 * The `CoreModule` is used to group singleton services like {@link ExceptionService} and single-use components like {@link NavComponent}.
 */
@NgModule({
  imports: [SharedModule, AuthModule, NavComponent, AppSnackBarComponent, AlertComponent],
  exports: [AuthModule, MaterialModule, NavComponent, AppSnackBarComponent, TranslateModule]
})
export class CoreModule {}
