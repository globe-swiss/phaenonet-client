import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { IndividualService } from './individual.service';
import { IndividualEditComponent } from './individual-edit.component';
import { IndividualDetailComponent } from './individual-detail.component';
import { IndividualRoutingModule } from './individual-routing.module';
import { MasterdataModule } from '../masterdata/masterdata.module';

@NgModule({
  imports: [SharedModule, IndividualRoutingModule, MasterdataModule],
  declarations: [IndividualEditComponent, IndividualDetailComponent],
  providers: [IndividualService],
  exports: []
})
export class IndividualModule {}
