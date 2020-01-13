import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { GroupRoutingModule } from './group-routing.module';
import { GroupComponent } from './group.component';
import { GroupOverviewComponent } from './group-overview.component';
import { GroupService } from './group.service';

@NgModule({
  imports: [SharedModule, GroupRoutingModule],
  declarations: [GroupComponent, GroupOverviewComponent],
  providers: [GroupService],
  exports: []
})
export class GroupModule {}
