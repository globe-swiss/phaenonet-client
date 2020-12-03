import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '../core/material.module';

import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DisableNotAuthorizedDirective } from '../auth/disable-not-authorized.directive';
import { RemoveNotAuthorizedDirective } from '../auth/remove-not-authorized.directive';
import { NotFoundComponent } from '../core/not-found.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GoogleMapsModule } from '@angular/google-maps';
import { DisableNotOwnerDirective } from '../auth/disable-not-owner.directive';
import { CopyClipboardDirective } from './copy-clipboard.directive';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { RoundPipe } from './round.pipe';
import { LoadingGuard } from './LoadingGuard';

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
    RoundPipe
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
    RoundPipe
  ],
  providers: [LoadingGuard]
})
export class SharedModule {}
