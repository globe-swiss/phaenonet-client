import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { MasterdataService } from './masterdata.service';

@NgModule({
  imports: [SharedModule],
  declarations: [],
  providers: [MasterdataService],
  exports: []
})
export class MasterdataModule {}
