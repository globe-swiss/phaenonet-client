import { NgModule } from '@angular/core';
import { ActivityModule } from '../activity/activity.module';
import { IndividualModule } from '../individual/individual.module';
import { SharedModule } from '../shared/shared.module';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileEditComponent } from './profile-edit.component';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';
import { ActivityItemComponent } from './activity-item/activity-item.component';
import { ActivityListComponent } from './activity-list/activity-list.component';
import { ObservationItemComponent } from './observation-item/observation-item.component';
import { ObservationListComponent } from './observation-list/observation-list.component';
import { ProfileDetailsComponent } from './profile-details/profile-details.component';
import { ProfilePublicComponent } from './profile-public/profile-public.component';

@NgModule({
  imports: [SharedModule, ProfileRoutingModule, IndividualModule, ActivityModule],
  declarations: [ProfileComponent, ProfileEditComponent, ChangePasswordDialogComponent,
    ActivityItemComponent, ActivityListComponent, ObservationItemComponent,
    ObservationListComponent, ProfileDetailsComponent, ProfilePublicComponent],
  providers: [],
  exports: [],
  entryComponents: [ChangePasswordDialogComponent]
})
export class ProfileModule {}
