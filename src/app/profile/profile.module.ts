import { NgModule } from '@angular/core';
import { ActivityModule } from '../activity/activity.module';
import { IndividualModule } from '../individual/individual.module';
import { SharedModule } from '../shared/shared.module';
import { ProfileDetailComponent } from './profile-detail.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileEditComponent } from './profile-edit.component';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';
import { ActivityItemComponent } from './activity-item/activity-item.component';
import { ActivityListComponent } from './activity-list/activity-list.component';

@NgModule({
  imports: [SharedModule, ProfileRoutingModule, IndividualModule, ActivityModule],
  declarations: [ProfileDetailComponent, ProfileEditComponent, ChangePasswordDialogComponent, ActivityItemComponent, ActivityListComponent],
  providers: [],
  exports: [],
  entryComponents: [ChangePasswordDialogComponent]
})
export class ProfileModule {}
