import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../core/material.module';
import { NotFoundComponent } from '../core/not-found.component';
import { SensorsBadgeComponent } from '../sensors/sensors-badge.component';
import { SensorsBoxComponent } from '../sensors/sensors-box.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { CopyClipboardDirective } from './copy-clipboard.directive';
import { LimitToPipe } from './limitTo.pipe';
import { LoadingGuard } from './LoadingGuard';
import { RoundPipe } from './round.pipe';
import { ShortdatePipe } from './shortdate.pipe';
import { ShortdatetimePipe } from './shortdatetime.pipe';
import { IndividualSubscriptionButtonComponent } from './subscription/individual-subscription-button/individual-subscription-button.component';
import { UserSubscriptionButtonComponent } from './subscription/user-subscription-button/user-subscription-button.component';
import { TypeGuardPipe } from './type-guard.pipe';

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
    GoogleMapsModule,
    NotFoundComponent,
    CopyClipboardDirective,
    ConfirmationDialogComponent,
    RoundPipe,
    ShortdatePipe,
    ShortdatetimePipe,
    LimitToPipe,
    UserSubscriptionButtonComponent,
    IndividualSubscriptionButtonComponent,
    SensorsBadgeComponent,
    SensorsBoxComponent,
    TypeGuardPipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    CopyClipboardDirective,
    RouterModule,
    TranslateModule,
    GoogleMapsModule,
    RoundPipe,
    ShortdatePipe,
    ShortdatetimePipe,
    LimitToPipe,
    UserSubscriptionButtonComponent,
    IndividualSubscriptionButtonComponent,
    TypeGuardPipe,
    SensorsBadgeComponent,
    SensorsBoxComponent
  ]
})
export class SharedModule {}
