import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { IndividualService } from './individual.service';

@NgModule({
  imports: [SharedModule],
  declarations: [],
  providers: [IndividualService],
  exports: []
})
export class IndividualModule {}
