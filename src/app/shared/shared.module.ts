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
import { GravatarModule } from 'ngx-gravatar';
import { GoogleMapsModule } from '@angular/google-maps';

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
    GravatarModule,
    GoogleMapsModule
  ],
  declarations: [RemoveNotAuthorizedDirective, DisableNotAuthorizedDirective, NotFoundComponent],
  exports: [
    CommonModule,
    DisableNotAuthorizedDirective,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    RemoveNotAuthorizedDirective,
    RouterModule,
    TranslateModule,
    FlexLayoutModule,
    GravatarModule,
    GoogleMapsModule
  ],
  providers: []
})
export class SharedModule {}
