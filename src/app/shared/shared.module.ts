import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DisableNotAuthorizedDirective } from '../auth/disable-not-authorized.directive';
import { DisableNotOwnerDirective } from '../auth/disable-not-owner.directive';
import { RemoveNotAuthorizedDirective } from '../auth/remove-not-authorized.directive';
import { MaterialModule } from '../core/material.module';
import { NotFoundComponent } from '../core/not-found.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { CopyClipboardDirective } from './copy-clipboard.directive';
import { LimitToPipe } from './limitTo.pipe';
import { LoadingGuard } from './LoadingGuard';
import { RoundPipe } from './round.pipe';
import { ShortdatePipe } from './shortdate.pipe';
import { ShortdatetimePipe } from './shortdatetime.pipe';
import { IndividualSubscriptionButtonComponent } from './subscription/individual-subscription-button/individual-subscription-button.component';
import { UserSubscriptionButtonComponent } from './subscription/user-subscription-button/user-subscription-button.component';

/**
 * The `SharedModule` is used to group common services and modules like {@link TranslateModule}.
 */
@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    GoogleMapsModule
  ],
  declarations: [
    RemoveNotAuthorizedDirective,
    DisableNotAuthorizedDirective,
    DisableNotOwnerDirective,
    NotFoundComponent,
    CopyClipboardDirective,
    ConfirmationDialogComponent,
    RoundPipe,
    ShortdatePipe,
    ShortdatetimePipe,
    LimitToPipe,
    UserSubscriptionButtonComponent,
    IndividualSubscriptionButtonComponent
  ],
  exports: [
    CommonModule,
    DisableNotAuthorizedDirective,
    DisableNotOwnerDirective,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    RemoveNotAuthorizedDirective,
    CopyClipboardDirective,
    RouterModule,
    TranslateModule,
    FlexLayoutModule,
    GoogleMapsModule,
    RoundPipe,
    ShortdatePipe,
    ShortdatetimePipe,
    LimitToPipe,
    UserSubscriptionButtonComponent,
    IndividualSubscriptionButtonComponent
  ],
  providers: [LoadingGuard]
})
export class SharedModule {}
