import { NgModule } from '@angular/core';

import { ActivityModule } from '../activity/activity.module';
import { IndividualModule } from '../individual/individual.module';
import { SharedModule } from '../shared/shared.module';
import { ChangeEmailDialogComponent } from './change-email-dialog/change-email-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ActivityItemComponent } from './profile/activity-item/activity-item.component';
import { ActivityListComponent } from './profile/activity-list/activity-list.component';
import { ObservationItemComponent } from './profile/observation-item/observation-item.component';
import { ObservationListComponent } from './profile/observation-list/observation-list.component';
import { ProfileDetailsComponent } from './profile/profile-details/profile-details.component';
import { ProfilePublicComponent } from './profile/profile-public/profile-public.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  imports: [SharedModule, ProfileRoutingModule, IndividualModule, ActivityModule],
  declarations: [
    ProfileComponent,
    ProfileEditComponent,
    ChangePasswordDialogComponent,
    ActivityItemComponent,
    ActivityListComponent,
    ObservationItemComponent,
    ObservationListComponent,
    ProfileDetailsComponent,
    ProfilePublicComponent,
    ChangeEmailDialogComponent
  ],
  providers: [],
  exports: [],
  entryComponents: [ChangePasswordDialogComponent]
})
export class ProfileModule {}
