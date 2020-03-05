import { NgModule } from '@angular/core';
import { ActivityModule } from '../activity/activity.module';
import { IndividualModule } from '../individual/individual.module';
import { SharedModule } from '../shared/shared.module';
import { ProfileDetailComponent } from './profile-detail.component';
import { ProfileRoutingModule } from './profile-routing.module';

@NgModule({
  imports: [SharedModule, ProfileRoutingModule, IndividualModule, ActivityModule],
  declarations: [ProfileDetailComponent],
  providers: [],
  exports: []
})
export class ProfileModule {}
