import { NgModule } from '@angular/core';
import { ActivityModule } from '../activity/activity.module';
import { IndividualModule } from '../individual/individual.module';
import { SharedModule } from '../shared/shared.module';
import { ChangeEmailDialogComponent } from './profile-edit/change-email-dialog/change-email-dialog.component';
import { ChangePasswordDialogComponent } from './profile-edit/change-password-dialog/change-password-dialog.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ActivityItemComponent } from './profile/activity-item/activity-item.component';
import { ActivityListComponent } from './profile/activity-list/activity-list.component';
import { FollowListComponent } from './profile/follow-list/follow-list.component';
import { ObservationItemComponent } from './profile/observation-item/observation-item.component';
import { ObservationListComponent } from './profile/observation-list/observation-list.component';
import { ProfileDetailsComponent } from './profile/profile-details/profile-details.component';
import { ProfilePublicComponent } from './profile/profile-public/profile-public.component';
import { ProfileComponent } from './profile/profile.component';
import { UserItemComponent } from './profile/user-item/user-item.component';
import { InviteComponent } from './invite/invite.component';
import { InviteItemComponent } from './invite/invite-item/invite-item.component';
import { InviteListComponent } from './invite/invite-list/invite-list.component';
import { InviteDialogComponent } from './invite/invite-dialog/invite-dialog.component';

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
    ChangeEmailDialogComponent,
    FollowListComponent,
    UserItemComponent,
    InviteComponent,
    InviteItemComponent,
    InviteListComponent,
    InviteDialogComponent
  ],
  providers: [],
  exports: [],
  entryComponents: [ChangePasswordDialogComponent]
})
export class ProfileModule {}
