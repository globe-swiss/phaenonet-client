import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { IndividualService } from './individual.service';
import { IndividualEditComponent } from './individual-edit.component';
import { IndividualDetailComponent } from './individual-detail.component';
import { IndividualRoutingModule } from './individual-routing.module';
import { MasterdataModule } from '../masterdata/masterdata.module';
import { PhenophaseDialogComponent } from './phenophase-dialog.component';
import { ObservationModule } from '../observation/observation.module';
import { ActivityModule } from '../activity/activity.module';

@NgModule({
  imports: [SharedModule, IndividualRoutingModule, MasterdataModule, ObservationModule, ActivityModule],
  declarations: [IndividualEditComponent, IndividualDetailComponent, PhenophaseDialogComponent],
  providers: [IndividualService],
  exports: [],
  entryComponents: [PhenophaseDialogComponent]
})
export class IndividualModule {}
